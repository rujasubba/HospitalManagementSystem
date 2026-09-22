
import React from "react";

const PatientDashboard = () => {
    const styles = {
        dashboard: {
            display: "flex",
            minHeight: "100vh",
            backgroundColor: "#f4f7fc",
            fontFamily: "Arial, sans-serif",
        },

        sidebar: {
            width: "250px",
            backgroundColor: "#1f2937",
            color: "white",
            padding: "25px",
        },

        logo: {
            marginBottom: "40px",
            fontSize: "28px",
            fontWeight: "bold",
        },

        menu: {
            listStyle: "none",
            padding: 0,
        },

        menuItem: {
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "8px",
            cursor: "pointer",
            backgroundColor: "#374151",
        },

        mainContent: {
            flex: 1,
            padding: "30px",
        },

        topbar: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            flexWrap: "wrap",
            gap: "20px",
        },

        heading: {
            fontSize: "32px",
            marginBottom: "5px",
        },

        subHeading: {
            color: "gray",
        },

        profileSection: {
            display: "flex",
            alignItems: "center",
            gap: "15px",
        },

        searchBox: {
            padding: "10px 15px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            outline: "none",
        },

        profileImg: {
            width: "45px",
            height: "45px",
            borderRadius: "50%",
        },

        cards: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "35px",
        },

        card: {
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        },

        cardTitle: {
            color: "gray",
            marginBottom: "15px",
        },

        cardNumber: {
            fontSize: "30px",
            fontWeight: "bold",
            color: "#2563eb",
        },

        tableSection: {
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            overflowX: "auto",
        },

        tableHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
        },

        button: {
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
        },

        table: {
            width: "100%",
            borderCollapse: "collapse",
        },

        th: {
            backgroundColor: "#f3f4f6",
            padding: "15px",
            textAlign: "left",
        },

        td: {
            padding: "15px",
            borderBottom: "1px solid #eee",
        },

        statusCompleted: {
            backgroundColor: "#10b981",
            color: "white",
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "14px",
        },

        statusPending: {
            backgroundColor: "#f59e0b",
            color: "white",
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "14px",
        },

        statusCancelled: {
            backgroundColor: "#ef4444",
            color: "white",
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "14px",
        },
    };

    return (
        <div style={styles.dashboard}>
            <aside style={styles.sidebar}>
                <h2 style={styles.logo}>MediCare</h2>

                <ul style={styles.menu}>
                    <li style={styles.menuItem}>Dashboard</li>
                    <li style={styles.menuItem}>Appointments</li>
                    <li style={styles.menuItem}>Doctors</li>
                    <li style={styles.menuItem}>Medical Records</li>
                    <li style={styles.menuItem}>Prescriptions</li>
                    <li style={styles.menuItem}>Billing</li>
                    <li style={styles.menuItem}>Messages</li>
                    <li style={styles.menuItem}>Settings</li>
                </ul>
            </aside>

            <main style={styles.mainContent}>
                <header style={styles.topbar}>
                    <div>
                        <h1 style={styles.heading}>Patient Dashboard</h1>
                        <p style={styles.subHeading}>
                            Welcome back, Patient 👋
                        </p>
                    </div>

                    <div style={styles.profileSection}>
                        <input
                            type="text"
                            placeholder="Search..."
                            style={styles.searchBox}
                        />

                        <img
                            src="https://i.pravatar.cc/100"
                            alt="profile"
                            style={styles.profileImg}
                        />
                    </div>
                </header>

                <section style={styles.cards}>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Upcoming Appointments</h3>
                        <p style={styles.cardNumber}>04</p>
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Total Doctors</h3>
                        <p style={styles.cardNumber}>12</p>
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Prescriptions</h3>
                        <p style={styles.cardNumber}>08</p>
                    </div>

                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Pending Bills</h3>
                        <p style={styles.cardNumber}>$450</p>
                    </div>
                </section>

                <section style={styles.tableSection}>
                    <div style={styles.tableHeader}>
                        <h2>Recent Appointments</h2>
                        <button style={styles.button}>View All</button>
                    </div>

                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Doctor</th>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Time</th>
                                <th style={styles.th}>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr>
                                <td style={styles.td}>Dr. John Smith</td>
                                <td style={styles.td}>20 Aug 2026</td>
                                <td style={styles.td}>10:30 AM</td>
                                <td style={styles.td}>
                                    <span style={styles.statusCompleted}>
                                        Completed
                                    </span>
                                </td>
                            </tr>

                            <tr>
                                <td style={styles.td}>Dr. Sarah Lee</td>
                                <td style={styles.td}>25 Aug 2026</td>
                                <td style={styles.td}>02:00 PM</td>
                                <td style={styles.td}>
                                    <span style={styles.statusPending}>
                                        Pending
                                    </span>
                                </td>
                            </tr>

                            <tr>
                                <td style={styles.td}>Dr. Michael Brown</td>
                                <td style={styles.td}>28 Aug 2026</td>
                                <td style={styles.td}>11:00 AM</td>
                                <td style={styles.td}>
                                    <span style={styles.statusCancelled}>
                                        Cancelled
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    );
};

export default PatientDashboard;