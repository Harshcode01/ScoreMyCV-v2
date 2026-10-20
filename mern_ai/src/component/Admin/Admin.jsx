import React, { useState, useEffect } from "react";
import styles from "./Admin.module.css";
import withAuthHOC from "../../utils/HOC/withAuthHOC";
import axios from "../../utils/axios";
import SpatialCard from "../Common/SpatialCard";
import { ShieldAlert, Users, Layers, CheckCircle2, AlertCircle } from "lucide-react";

const Admin = () => {
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoader(true);
      try {
        const results = await axios.get("api/resume/get");
        if (results?.data?.resumes) {
          setData(results.data.resumes);
        }
      } catch (err) {
        console.error("Admin fetch error:", err);
      } finally {
        setLoader(false);
      }
    };
    fetchAllData();
  }, []);

  const getScoreDetails = (score) => {
    const val = Number(score || 0);
    if (val >= 75) {
      return { color: "#10B981", bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)" };
    }
    if (val >= 50) {
      return { color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)" };
    }
    return { color: "#F43F5E", bg: "rgba(244, 63, 94, 0.15)", border: "rgba(244, 63, 94, 0.3)" };
  };

  return (
    <div className={styles.adminContainer}>
      <header className={styles.adminHeader}>
        <div className={styles.telemetryTopRow}>
          <span>WORKSPACE // 03</span>
          <span>•</span>
          <span>ADMINISTRATIVE_CONTROL_MATRIX</span>
          <span>•</span>
          <span>SECURITY_LEVEL: ROOT</span>
        </div>
        <div className={styles.adminTitleRow}>
          <h1 className={styles.adminHeading}>Admin Management Console</h1>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#818CF8", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
            <ShieldAlert size={16} />
            <span>ROOT_PRIVILEGES // ACTIVE</span>
          </div>
        </div>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          Global overview of all processed resumes, user submissions, and Cohere ATS evaluations across the system.
        </p>
      </header>

      <main className={styles.adminGrid}>
        {loader && (
          <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
            FETCHING_GLOBAL_RECORDS...
          </div>
        )}

        {!loader &&
          data.map((item, idx) => {
            const scoreDetails = getScoreDetails(item.score);
            const userInitial = item?.user?.name ? item.user.name.charAt(0).toUpperCase() : "U";
            const recordTelemetry = `0${(idx % 9) + 1} // USER_AUDIT`;

            return (
              <SpatialCard
                key={item._id}
                className={styles.adminCard}
                tiltIntensity={5}
                telemetry={recordTelemetry}
              >
                <div className={styles.userRow}>
                  <div className={styles.userAvatar}>{userInitial}</div>
                  <div>
                    <div className={styles.userName}>{item?.user?.name || "Anonymous User"}</div>
                    <div className={styles.userEmail}>{item?.user?.email || "No email provided"}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}>
                    ATS_MATCH_INDEX:
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "13px",
                      fontWeight: 800,
                      color: scoreDetails.color,
                      background: scoreDetails.bg,
                      border: `1px solid ${scoreDetails.border}`,
                      padding: "3px 10px",
                      borderRadius: "9999px",
                    }}
                  >
                    {item.score}%
                  </span>
                </div>

                <div className={styles.feedbackBox}>
                  {item.feedback}
                </div>
              </SpatialCard>
            );
          })}
      </main>
    </div>
  );
};

export default withAuthHOC(Admin);
