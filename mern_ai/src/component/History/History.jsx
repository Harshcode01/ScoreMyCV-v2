import { useState, useEffect, useContext, useMemo } from "react";
import styles from "./History.module.css";
import withAuthHOC from "../../utils/HOC/withAuthHOC";
import axios from "../../utils/axios";
import { AuthContext } from "../../utils/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import SpotlightBentoCard from "../ui/SpotlightBentoCard";
import ChronographScoreDial from "../ui/ChronographScoreDial";
import {
  FileText,
  Search,
  ArrowUpRight,
  X,
  Copy,
  Check,
  Award,
  Layers,
  Activity,
  ShieldCheck,
  Clock,
  Loader2,
} from "lucide-react";

// Mini SVG score ring component
const MiniScoreRing = ({ score }) => {
  const num = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  const color = num >= 75 ? "#10B981" : num >= 50 ? "#F59E0B" : "#F43F5E";
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c - (num / 100) * c;

  return (
    <div className={styles.miniRingWrapper}>
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="3.5"
        />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transformOrigin: "center",
            transform: "rotate(-90deg)",
            transition: "stroke-dashoffset 0.6s ease",
          }}
        />
      </svg>
      <span className={styles.miniScoreNum} style={{ color }}>
        {num}%
      </span>
    </div>
  );
};

const History = () => {
  const { userInfo } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [selectedScan, setSelectedScan] = useState(null);
  const [copied, setCopied] = useState(false);

  // Exact API request preservation
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userInfo?._id) return;
      setLoading(true);
      try {
        const results = await axios.get(`/api/resume/get/${userInfo._id}`);
        if (results?.data?.resumes) {
          setData(results.data.resumes);
        }
      } catch (err) {
        console.error("Failed to fetch resume history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userInfo?._id]);

  // Keyboard Escape listener for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedScan(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered and searched data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const score = Number(item.score || 0);
      const textToSearch = `${item.job_desc || ""} ${item.feedback || ""} ${
        item.resume_name || ""
      }`.toLowerCase();

      const matchesSearch = textToSearch.includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (scoreFilter === "elite") return score >= 75;
      if (scoreFilter === "competitive") return score >= 50 && score < 75;
      if (scoreFilter === "optimize") return score < 50;
      return true;
    });
  }, [data, searchQuery, scoreFilter]);

  // Top Metrics Ribbon computations
  const totalScans = data.length;
  const avgScore = totalScans
    ? Math.round(data.reduce((acc, curr) => acc + Number(curr.score || 0), 0) / totalScans)
    : 0;
  const peakScore = totalScans
    ? Math.max(...data.map((item) => Number(item.score || 0)))
    : 0;

  const handleCopyModalFeedback = () => {
    if (!selectedScan?.feedback) return;
    navigator.clipboard.writeText(
      `ScoreMyCV Scan Dossier\nScore: ${selectedScan.score}%\n\nTarget Job:\n${
        selectedScan.job_desc || "N/A"
      }\n\nAI Recommendations:\n${selectedScan.feedback}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Structured insight cards for modal
  const modalInsights = selectedScan?.feedback
    ? selectedScan.feedback
        .split(/\n+/)
        .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
        .filter((line) => line.length > 5)
    : [];

  return (
    <div className={styles.historyPage}>
      {/* 1. Header */}
      <header className={styles.historyHeader}>
        <div className={styles.headingCol}>
          <span className={styles.headingSub}>[INTELLIGENCE // ARCHIVE]</span>
          <h1 className={styles.headingTitle}>Telemetry History</h1>
        </div>

        <div className="telemetry-tag">
          RECORD COUNT // {filteredData.length} OF {totalScans} TOTAL
        </div>
      </header>

      {/* 2. Top Metrics Ribbon: 3 SpotlightBentoCards */}
      <section className={styles.metricsRibbon} aria-label="Summary Metrics Ribbon">
        {/* Metric 1: Total Scans */}
        <SpotlightBentoCard>
          <div className={styles.metricCard}>
            <div className={styles.metricCardHeader}>
              <span>TOTAL SCANS EXECUTED</span>
              <div className={styles.metricIconWrapper}>
                <Layers size={17} />
              </div>
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricNumber}>{totalScans}</span>
              <span className={styles.metricUnit}>SCANS</span>
            </div>
            <span className={styles.metricSubtext}>
              Processed through Cohere LLM pipeline
            </span>
          </div>
        </SpotlightBentoCard>

        {/* Metric 2: Average ATS Match */}
        <SpotlightBentoCard>
          <div className={styles.metricCard}>
            <div className={styles.metricCardHeader}>
              <span>AVERAGE ATS MATCH %</span>
              <div className={styles.metricIconWrapper}>
                <Activity size={17} />
              </div>
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricNumber}>{avgScore}</span>
              <span className={styles.metricUnit}>%</span>
            </div>
            <span className={styles.metricSubtext}>
              Aggregated mean candidate compatibility
            </span>
          </div>
        </SpotlightBentoCard>

        {/* Metric 3: Peak ATS Score */}
        <SpotlightBentoCard>
          <div className={styles.metricCard}>
            <div className={styles.metricCardHeader}>
              <span>PEAK ATS SCORE %</span>
              <div className={styles.metricIconWrapper}>
                <Award size={17} />
              </div>
            </div>
            <div className={styles.metricValueRow}>
              <span className={styles.metricNumber}>{peakScore}</span>
              <span className={styles.metricUnit}>%</span>
            </div>
            <span className={styles.metricSubtext}>
              Highest recorded benchmark performance
            </span>
          </div>
        </SpotlightBentoCard>
      </section>

      {/* 3. Search & Filter Bar */}
      <section className={styles.filterBar} aria-label="Search and Tier Filters">
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by job description keywords, roles, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter scans by keyword"
          />
        </div>

        <div className={styles.filterPillGroup} role="group" aria-label="Score Tier Filters">
          <button
            type="button"
            className={`${styles.filterPill} ${
              scoreFilter === "all" ? styles.filterPillActive : ""
            }`}
            onClick={() => setScoreFilter("all")}
            data-interactive="true"
          >
            All ({totalScans})
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${
              scoreFilter === "elite" ? styles.filterPillActive : ""
            }`}
            onClick={() => setScoreFilter("elite")}
            data-interactive="true"
          >
            Elite (75%+)
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${
              scoreFilter === "competitive" ? styles.filterPillActive : ""
            }`}
            onClick={() => setScoreFilter("competitive")}
            data-interactive="true"
          >
            Competitive (50-74%)
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${
              scoreFilter === "optimize" ? styles.filterPillActive : ""
            }`}
            onClick={() => setScoreFilter("optimize")}
            data-interactive="true"
          >
            Optimize (&lt;50%)
          </button>
        </div>
      </section>

      {/* 4. Responsive CSS Bento Grid */}
      <section className={styles.bentoGrid} aria-label="Resume Scan History Bento Grid">
        {filteredData.length > 0 ? (
          filteredData.map((item, idx) => {
            const formattedDate = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Historical";

            return (
              <SpotlightBentoCard key={item._id || idx}>
                <div className={styles.historyBentoCard}>
                  {/* Card Top Row */}
                  <div className={styles.cardTopRow}>
                    <MiniScoreRing score={item.score} />
                    <span className={styles.cardDateBadge}>
                      <Clock size={11} style={{ display: "inline", marginRight: 4 }} />
                      {formattedDate}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className={styles.cardBody}>
                    <h3 className={styles.jobDescPreview}>
                      {item.job_desc || "Target Job Specification"}
                    </h3>
                    <p className={styles.feedbackPreview}>
                      {item.feedback || "Detailed analysis feedback recorded."}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    className={styles.openDossierBtn}
                    onClick={() => setSelectedScan(item)}
                    data-interactive="true"
                    aria-label={`Open Full Dossier for scan from ${formattedDate}`}
                  >
                    <span>Open Full Dossier</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </SpotlightBentoCard>
            );
          })
        ) : loading ? (
          <div className={styles.emptyState}>
            <Loader2 size={36} className="animate-spin" color="var(--accent-cyan)" />
            <div>
              <h3>Fetching Telemetry History...</h3>
              <p>Querying vector database records for your session.</p>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <FileText size={40} className={styles.emptyIcon} />
            <div>
              <h3>No Matching Scan Records</h3>
              <p>Adjust your search query or run a new scan from the Dashboard workspace.</p>
            </div>
          </div>
        )}
      </section>

      {/* 5. Framer Motion Glass Modal / Dossier Drawer */}
      <AnimatePresence>
        {selectedScan && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedScan(null)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="dossier-dialog-title"
            >
              {/* Modal Header */}
              <div className={styles.modalHeader}>
                <div className={styles.modalTitleGroup}>
                  <ShieldCheck size={20} color="var(--accent-cyan)" />
                  <span id="dossier-dialog-title" className={styles.modalTitle}>
                    Resume Intelligence Dossier
                  </span>
                </div>

                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setSelectedScan(null)}
                  data-interactive="true"
                  aria-label="Close dossier dialog"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className={styles.modalScrollArea}>
                {/* Score Dial & Meta */}
                <div className={styles.modalTopRow}>
                  <ChronographScoreDial score={selectedScan.score} size={190} />

                  <div className={styles.modalMetaDetails}>
                    <span className="telemetry-tag">[AUDIT COMPLETED]</span>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      <strong>Analyzed:</strong>{" "}
                      {selectedScan.createdAt
                        ? new Date(selectedScan.createdAt).toLocaleString()
                        : "Session Timestamp Recorded"}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      <strong>Score Status:</strong>{" "}
                      {Number(selectedScan.score) >= 75
                        ? "Optimal ATS Match"
                        : Number(selectedScan.score) >= 50
                        ? "Moderate Competitive Match"
                        : "Optimization Strongly Recommended"}
                    </div>
                  </div>
                </div>

                {/* Full Job Description Section */}
                <div className={styles.modalSection}>
                  <span className={styles.modalSectionLabel}>
                    [TARGET JOB SPECIFICATION]
                  </span>
                  <div className={styles.fullJobDescBox}>
                    {selectedScan.job_desc || "No job description text recorded."}
                  </div>
                </div>

                {/* Structured AI Feedback Cards */}
                <div className={styles.modalSection}>
                  <span className={styles.modalSectionLabel}>
                    [AI DIAGNOSTIC RECOMMENDATIONS]
                  </span>
                  <div className={styles.modalInsightsGrid}>
                    {modalInsights.length > 0 ? (
                      modalInsights.map((insight, idx) => (
                        <div key={idx} className={styles.modalInsightCard}>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "var(--accent-cyan)",
                              background: "rgba(6, 182, 212, 0.12)",
                              border: "1px solid rgba(6, 182, 212, 0.3)",
                              padding: "2px 6px",
                              borderRadius: 6,
                              flexShrink: 0,
                            }}
                          >
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span style={{ fontSize: 13, lineHeight: 1.5, color: "var(--text-primary)" }}>
                            {insight}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className={styles.modalInsightCard}>
                        <span style={{ fontSize: 13, color: "var(--text-primary)" }}>
                          {selectedScan.feedback || "Detailed feedback available."}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className={styles.modalFooter}>
                <span className="telemetry-tag">[SESSION // ARCHIVED]</span>

                <button
                  type="button"
                  className={styles.copyDossierBtn}
                  onClick={handleCopyModalFeedback}
                  data-interactive="true"
                  aria-label="Copy Full Dossier"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? "Dossier Copied!" : "Copy Dossier"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default withAuthHOC(History);
