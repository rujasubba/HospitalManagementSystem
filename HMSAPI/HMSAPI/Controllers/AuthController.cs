using HMSAPI.Data;
using HMSAPI.DTOs;
using HMSAPI.Models;
using HMSAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HMSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(
        UserManager<ApplicationUser> userManager,
        ITokenService tokenService,
        AppDbContext context) : ControllerBase
    {
        private const string InvalidCredentials = "Invalid email or password.";

        private static readonly string[] ValidGenders = { "Male", "Female", "Other" };

        private async Task<UserInfoDto> ToUserInfo(ApplicationUser user) => new()
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            Roles = (await userManager.GetRolesAsync(user)).ToList(),
        };

        private async Task<AuthResponseDto> BuildAuthResponse(ApplicationUser user)
        {
            var info = await ToUserInfo(user);
            var (token, expiresAt) = tokenService.CreateToken(user, info.Roles);
            return new AuthResponseDto { Token = token, ExpiresAt = expiresAt, User = info };
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var dob = dto.DateOfBirth!.Value.Date;
            var today = DateTime.Today;

            if (dob > today)
                return BadRequest(new { message = "Date of birth can't be in the future." });

            var age = today.Year - dob.Year;
            if (dob > today.AddYears(-age)) age--;
            if (age > 120)
                return BadRequest(new { message = "Please enter a valid date of birth." });

            if (!ValidGenders.Contains(dto.Gender))
                return BadRequest(new { message = "Gender must be Male, Female, or Other." });

            var email = dto.Email.Trim();
            var fullName = dto.FullName.Trim();

            await using var tx = await context.Database.BeginTransactionAsync();

            var patient = new Patient
            {
                FullName = fullName,
                Gender = dto.Gender,
                Age = age,
                DateOfBirth = dob,
                Phone = dto.Phone?.Trim() ?? string.Empty,
                Email = email,
                Status = "Outpatient",
            };
            context.Patients.Add(patient);
            await context.SaveChangesAsync();

            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FullName = fullName,
                PatientId = patient.Id,
            };

            var result = await userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                await tx.RollbackAsync();
                return BadRequest(new
                {
                    message = "Registration failed.",
                    errors = result.Errors.Select(e => e.Description),
                });
            }

            await userManager.AddToRoleAsync(user, Roles.Default);
            await tx.CommitAsync();

            return Ok(await BuildAuthResponse(user));
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await userManager.FindByEmailAsync(dto.Email.Trim());
            if (user == null) return Unauthorized(new { message = InvalidCredentials });

            if (await userManager.IsLockedOutAsync(user))
            {
                return StatusCode(StatusCodes.Status423Locked, new
                {
                    message = "Too many failed attempts. Please try again in a few minutes.",
                });
            }

            if (!await userManager.CheckPasswordAsync(user, dto.Password))
            {
                await userManager.AccessFailedAsync(user);
                return Unauthorized(new { message = InvalidCredentials });
            }

            await userManager.ResetAccessFailedCountAsync(user);
            return Ok(await BuildAuthResponse(user));
        }

        [Authorize(Roles = Roles.Admin)]
        [HttpPost("staff")]
        public async Task<IActionResult> CreateStaff(CreateStaffDto dto)
        {
            if (!Roles.Staff.Contains(dto.Role))
                return BadRequest(new { message = "Role must be Admin, Doctor, or Receptionist." });

            var email = dto.Email.Trim();
            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FullName = dto.FullName.Trim(),
                EmailConfirmed = true,
            };

            var result = await userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Could not create the account.",
                    errors = result.Errors.Select(e => e.Description),
                });
            }

            await userManager.AddToRoleAsync(user, dto.Role);
            return Ok(await ToUserInfo(user));
        }

        [Authorize(Roles = Roles.Admin)]
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await userManager.Users.OrderBy(u => u.FullName).ToListAsync();

            var result = new List<UserInfoDto>();
            foreach (var u in users) result.Add(await ToUserInfo(u));
            return Ok(result);
        }

        [Authorize(Roles = Roles.Admin)]
        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateRole(string id, UpdateUserRoleDto dto)
        {
            if (!Roles.All.Contains(dto.Role))
                return BadRequest("Unknown role.");

            var user = await userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            var currentRoles = await userManager.GetRolesAsync(user);

            if (currentRoles.Contains(Roles.Admin) && dto.Role != Roles.Admin)
            {
                var admins = await userManager.GetUsersInRoleAsync(Roles.Admin);
                if (admins.Count <= 1) return BadRequest("You can't remove the only Admin.");
            }

            await userManager.RemoveFromRolesAsync(user, currentRoles);
            await userManager.AddToRoleAsync(user, dto.Role);

            return Ok(await ToUserInfo(user));
        }
    }
}