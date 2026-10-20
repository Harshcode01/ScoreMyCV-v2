import { useContext, useState, useEffect, useRef } from "react";
import styles from "./Dashboard.module.css";
import withAuthHOC from "../../utils/HOC/withAuthHOC";
import axios from "../../utils/axios";
import { AuthContext } from "../../utils/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import SpotlightBentoCard from "../ui/SpotlightBentoCard";
import SplineScene3D from "../three/SplineScene3D";
import ChronographScoreDial from "../ui/ChronographScoreDial";
import {
  UploadCloud,
  Sparkles,
  Check,
  Copy,
  RotateCcw,
  ShieldCheck,
  FileCheck2,
} from "lucide-react";

// 4 Preset Job Descriptions
const PRESET_MERN = `Full Stack MERN Developer (React, Node.js, Express, MongoDB)
We are seeking an experienced Full Stack Engineer proficient with React, Node.js, Express.js, and MongoDB.
Responsibilities:
- Build responsive, accessible frontend interfaces in React and state management.
- Design scalable backend microservices and RESTful / GraphQL APIs with Node and Express.
- Optimize database queries, aggregations, and indexing in MongoDB.
- Ensure end-to-end security, JWT authentication, and automated CI/CD pipeline deployments.`;

const PRESET_FRONTEND = `Senior Frontend Engineer (React, TypeScript, Next.js)
Looking for a Senior Frontend Developer with 4+ years building high-performance web applications.
Responsibilities:
- Architect component libraries and design systems in React and TypeScript.
- Optimize Core Web Vitals (LCP, INP, CLS) and bundle performance.
- Implement state architectures with Redux/Zustand and data fetching via React Query.
- Ensure cross-browser accessibility (WCAG AA) and responsive mobile-first interfaces.`;

const PRESET_BACKEND = `Senior Backend Engineer (Node.js, Microservices, Distributed Systems)
We are looking for a Backend Systems Engineer to architect resilient distributed cloud services.
Responsibilities:
- Architect high-throughput REST APIs and event-driven architectures with Node.js and Redis.
- Manage SQL/NoSQL databases, schema migrations, and high-concurrency caching.
- Write thorough integration tests and instrument Prometheus/Grafana observability.
- Deploy containerized services with Docker and Kubernetes on AWS/GCP.`;

const SCANNING_LOGS = [
  "[01] Mounting PDF binary stream...",
  "[02] Tokenizing experience & skill matrix...",
  "[03] Benchmarking semantic vectors via Cohere AI...",
  "[04] Compiling ATS compatibility report...",
];

const Dashboard = () => {
  const { userInfo } = useContext(AuthContext);

  const [resumeFile, setResumeFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeLogIndex, setActiveLogIndex] = useState(0);

  const fileInputRef = useRef(null);

  // Auto-cycling terminal logs during scanning state
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setActiveLogIndex((prev) => (prev < SCANNING_LOGS.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  // Handle PDF file selection & drag-and-drop
  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Invalid format: Please provide an Application/PDF document (.pdf).");
      return;
    }
    setResumeFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Exact API request preservation
  const handleAnalyze = async () => {
    if (!resumeFile) {
      alert("Please upload your PDF resume binary.");
      return;
    }
    if (!jobDesc.trim()) {
      alert("Please enter target job specifications.");
      return;
    }
    if (!userInfo?._id) {
      alert("User authentication required. Please sign in to establish your account session.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("job_desc", jobDesc);
    formData.append("user", userInfo._id);

    setLoading(true);
    setActiveLogIndex(0);
    setResult(null);

    try {
      const response = await axios.post("/api/resume/addResume", formData);
      if (response?.data?.data) {
        setResult(response.data.data);
      } else if (response?.data?.resume) {
        setResult(response.data.resume);
      }
    } catch (err) {
      console.error("Resume analysis error:", err);
      alert("Failed to analyze resume. Please verify the backend Cohere service is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!result?.feedback) return;
    navigator.clipboard.writeText(
      `ScoreMyCV Analysis Report\nATS Score: ${result.score}%\n\nFeedback:\n${result.feedback}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetScan = () => {
    setResult(null);
    setResumeFile(null);
    setJobDesc("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Metrics
  const charCount = jobDesc.length;
  const wordCount = jobDesc.trim() ? jobDesc.trim().split(/\s+/).length : 0;

  // Parsed Feedback insight cards
  const insightCards = result?.feedback
    ? result.feedback
        .split(/\n+/)
        .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
        .filter((line) => line.length > 5)
    : [];

  return (
    <div className={styles.dashboardPage}>
      {/* 1. Top Workspace Header */}
      <header className={styles.workspaceHeader}>
        <div className={styles.userGreetingGroup}>
          <span className={styles.greetingSub}>[COMMAND // WORKSPACE ACTIVE]</span>
          <h1 className={styles.greetingTitle}>
            Hello, {userInfo?.name?.split(" ")[0] || "Architect"}
          </h1>
        </div>

        {/* Monospace System Status Pills */}
        <div className={styles.systemStatusPills}>
          <div className={`${styles.statusPill} ${styles.statusPillActive}`}>
            <span className={styles.dotPulse} />
            <span>ENGINE: COHERE</span>
          </div>
          <div className={styles.statusPill}>
            <span>FORMAT: PDF-BINARY</span>
          </div>
          <div className={styles.statusPill}>
            <span>LATENCY: 42MS</span>
          </div>
        </div>
      </header>

      {/* 2. Main Two-Column Workspace Grid */}
      <div className={styles.workspaceGrid}>
        {/* Left Column: Dropzone & Job Specification Command Editor */}
        <div className={styles.leftCol}>
          <SpotlightBentoCard>
            <div className={styles.leftColCard}>
              {/* Dropzone Header */}
              <div className={styles.dropzoneContainer}>
                <div className={styles.dropzoneLabelRow}>
                  <span>[01 // PDF RESUME BINARY]</span>
                  <span className="telemetry-tag">LAYER-1 EXTRACTABLE</span>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFiles(e.target.files)}
                  style={{ display: "none" }}
                  id="pdf-file-upload-input"
                  aria-label="Upload PDF Resume"
                />

                {!resumeFile ? (
                  /* Recessed Glass Chamber with Swiss Reticle Corners */
                  <div
                    className={`${styles.dropzoneChamber} ${
                      isDragging ? styles.dropzoneChamberDragging : ""
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    data-interactive="true"
                    role="button"
                    tabIndex={0}
                    aria-label="Upload PDF Resume Dropzone"
                  >
                    {/* Reticle Corners */}
                    <span className={`${styles.reticleCorner} ${styles.cornerTL}`}>┌</span>
                    <span className={`${styles.reticleCorner} ${styles.cornerTR}`}>┐</span>
                    <span className={`${styles.reticleCorner} ${styles.cornerBL}`}>└</span>
                    <span className={`${styles.reticleCorner} ${styles.cornerBR}`}>┘</span>

                    <div className={styles.dropzoneIconWrapper}>
                      <UploadCloud size={24} />
                    </div>

                    <div className={styles.dropzoneTitle}>
                      Drop PDF Resume Binary or Click to Select
                    </div>
                    <div className={styles.dropzoneMeta}>
                      Max 10MB • Application/PDF • Clean Text Stream
                    </div>
                  </div>
                ) : (
                  /* 3D Locked Document Cartridge (Selected State) */
                  <div className={`${styles.lockedCartridge} depth-z-2`}>
                    <div className={styles.cartridgeLeft}>
                      <div className={styles.cartridgeIcon}>
                        <FileCheck2 size={22} />
                      </div>
                      <div className={styles.cartridgeInfo}>
                        <span className={styles.cartridgeFilename}>{resumeFile.name}</span>
                        <div className={styles.cartridgeMetaRow}>
                          <span className={styles.cartridgeSize}>
                            {(resumeFile.size / 1024).toFixed(1)} KB
                          </span>
                          <span className={styles.lockedBadge}>
                            <ShieldCheck size={11} />
                            BINARY LOCKED
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={styles.replacePdfBtn}
                      data-interactive="true"
                      aria-label="Replace selected PDF"
                    >
                      Replace PDF
                    </button>
                  </div>
                )}
              </div>

              {/* Job Description Command Editor */}
              <div className={styles.editorSection}>
                <div className={styles.editorHeaderRow}>
                  <span className={styles.editorLabel}>
                    [02 // TARGET JOB SPECIFICATION]
                  </span>
                  <div className={styles.counterBadge}>
                    <span>{wordCount} WORDS</span> • <span>{charCount} CHARS</span>
                  </div>
                </div>

                {/* 4 Quick-Fill Preset Pills */}
                <div className={styles.presetPillRow}>
                  <button
                    type="button"
                    className={styles.presetPill}
                    onClick={() => setJobDesc(PRESET_MERN)}
                    data-interactive="true"
                  >
                    + Full Stack MERN
                  </button>
                  <button
                    type="button"
                    className={styles.presetPill}
                    onClick={() => setJobDesc(PRESET_FRONTEND)}
                    data-interactive="true"
                  >
                    + Frontend React
                  </button>
                  <button
                    type="button"
                    className={styles.presetPill}
                    onClick={() => setJobDesc(PRESET_BACKEND)}
                    data-interactive="true"
                  >
                    + Backend Node.js
                  </button>
                  {jobDesc && (
                    <button
                      type="button"
                      className={`${styles.presetPill} ${styles.presetClear}`}
                      onClick={() => setJobDesc("")}
                      data-interactive="true"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <textarea
                  className={styles.jobTextarea}
                  placeholder="Paste target job responsibilities, technical requirements, and core qualifications here..."
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  rows={8}
                  aria-label="Target Job Specification Input"
                />
              </div>

              {/* Analyze Resume 3D Shimmer Button */}
              <motion.button
                type="button"
                className={styles.analyzeBtn}
                onClick={handleAnalyze}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
                data-interactive="true"
                aria-label="Analyze Resume Against Job Specification"
              >
                <div className={styles.btnShimmer} />
                <Sparkles size={18} />
                <span>{loading ? "Synthesizing Vectors..." : "Analyze Resume"}</span>
              </motion.button>
            </div>
          </SpotlightBentoCard>
        </div>

        {/* Right Column: Three Visual States via AnimatePresence */}
        <div className={styles.rightCol}>
          <AnimatePresence mode="wait">
            {/* STATE 1: IDLE STATE */}
            {!loading && !result && (
              <motion.div
                key="idle-state"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <SpotlightBentoCard>
                  <div className={styles.idleContainer}>
                    <div className={styles.idleHeader}>
                      <span>[NEURAL ATS PIPELINE // READY]</span>
                      <span>STAGE: STANDBY</span>
                    </div>

                    {/* Interactive 3D Spline Scene in Compact Mode */}
                    <SplineScene3D isScanning={false} compact={true} />

                    {/* 3-Step Architectural Pipeline Diagram */}
                    <div className={styles.pipelineGrid}>
                      <div className={styles.pipelineStep}>
                        <span className={styles.pipelineNum}>01.</span>
                        <span className={styles.pipelineTitle}>
                          Lexical PDF Extraction
                        </span>
                      </div>
                      <div className={styles.pipelineStep}>
                        <span className={styles.pipelineNum}>02.</span>
                        <span className={styles.pipelineTitle}>
                          Semantic Vector Match
                        </span>
                      </div>
                      <div className={styles.pipelineStep}>
                        <span className={styles.pipelineNum}>03.</span>
                        <span className={styles.pipelineTitle}>
                          ATS Score Synthesis
                        </span>
                      </div>
                    </div>
                  </div>
                </SpotlightBentoCard>
              </motion.div>
            )}

            {/* STATE 2: ACTIVE SCANNING STATE */}
            {loading && (
              <motion.div
                key="scanning-state"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
              >
                <SpotlightBentoCard>
                  <div className={styles.scanningCard}>
                    <div className={styles.idleHeader} style={{ width: "100%" }}>
                      <span>[SYSTEM SCAN // IN PROGRESS]</span>
                      <span style={{ color: "var(--accent-cyan)" }}>PROCESSING STREAM</span>
                    </div>

                    {/* 3D Spline Scene in Scanning Velocity */}
                    <SplineScene3D isScanning={true} compact={true} />

                    {/* Volumetric Laser Document Grid */}
                    <div className={styles.volumetricLaserContainer}>
                      {/* Wireframe Document Graphic */}
                      <svg
                        className={styles.wireframeDocumentSvg}
                        width="160"
                        height="120"
                        viewBox="0 0 160 120"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <rect
                          x="20"
                          y="10"
                          width="120"
                          height="100"
                          rx="8"
                          stroke="#06B6D4"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />
                        <line x1="35" y1="30" x2="125" y2="30" stroke="#6366F1" strokeWidth="2" />
                        <line x1="35" y1="46" x2="110" y2="46" stroke="#94A3B8" strokeWidth="1.5" />
                        <line x1="35" y1="62" x2="120" y2="62" stroke="#94A3B8" strokeWidth="1.5" />
                        <line x1="35" y1="78" x2="85" y2="78" stroke="#94A3B8" strokeWidth="1.5" />
                        <line x1="35" y1="94" x2="115" y2="94" stroke="#06B6D4" strokeWidth="1.5" />
                      </svg>

                      {/* Glowing Cyan Sweeping Laser Beam */}
                      <div className={styles.laserBeam} />
                    </div>

                    {/* Auto-Cycling Monospace Terminal Logs */}
                    <div className={styles.terminalContainer}>
                      {SCANNING_LOGS.map((log, idx) => (
                        <div
                          key={idx}
                          className={`${styles.terminalLine} ${
                            idx === activeLogIndex ? styles.terminalLineActive : ""
                          }`}
                        >
                          <span>{log}</span>
                          {idx === activeLogIndex && <span className={styles.terminalCursor} />}
                        </div>
                      ))}
                    </div>
                  </div>
                </SpotlightBentoCard>
              </motion.div>
            )}

            {/* STATE 3: COMPLETED ANALYSIS STATE */}
            {!loading && result && (
              <motion.div
                key="completed-state"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
                style={{ display: "flex", flexDirection: "column", gap: "20px" }}
              >
                {/* Top Action Bar */}
                <div className={styles.resultsActionBar}>
                  <button
                    type="button"
                    onClick={handleCopyReport}
                    className={`${styles.actionBtn} ${styles.copyReportBtn}`}
                    data-interactive="true"
                    aria-label="Copy Full Analysis Report"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? "Copied to Clipboard!" : "Copy Full Report"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetScan}
                    className={`${styles.actionBtn} ${styles.newScanBtn}`}
                    data-interactive="true"
                    aria-label="Reset and Run New Scan"
                  >
                    <RotateCcw size={14} />
                    <span>New Scan</span>
                  </button>
                </div>

                {/* Top Bento Card: Chronograph Score Dial & Metadata */}
                <SpotlightBentoCard>
                  <div className={styles.completedTopCard}>
                    <ChronographScoreDial score={result.score} size={230} />

                    <div className={styles.scoreMetaCol}>
                      <div className={styles.scoreMetaHeader}>
                        <span className="telemetry-tag">[SCAN // VERIFIED]</span>
                        <span className={styles.counterBadge}>
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>

                      <h2 className={styles.scoreMetaHeading}>
                        {Number(result.score) >= 75
                          ? "High Compatibility Benchmark"
                          : Number(result.score) >= 50
                          ? "Moderate Semantic Alignment"
                          : "Critical Alignment Required"}
                      </h2>

                      <p className={styles.scoreMetaText}>
                        Your resume has been semantically parsed and compared against the target
                        specifications. Review the actionable rewrite points below to reach peak
                        candidate placement.
                      </p>

                      <div className={styles.scoreMetaTags}>
                        <span className={styles.metaTagPill}>Model: Cohere Command</span>
                        <span className={styles.metaTagPill}>Vector: 1024-dim</span>
                        <span className={styles.metaTagPill}>Status: Synthesized</span>
                      </div>
                    </div>
                  </div>
                </SpotlightBentoCard>

                {/* Bottom Bento Card: Numbered Glass Insight Cards */}
                <SpotlightBentoCard>
                  <div className={styles.insightsBentoCard}>
                    <div className={styles.insightsHeader}>
                      <span>[AI DIAGNOSTIC RECOMMENDATIONS]</span>
                      <span>{insightCards.length} ACTIONABLE ITEMS</span>
                    </div>

                    <div className={styles.insightsGrid}>
                      {insightCards.length > 0 ? (
                        insightCards.map((insight, idx) => (
                          <div key={idx} className={styles.insightCard}>
                            <span className={styles.insightBadge}>
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <span className={styles.insightText}>{insight}</span>
                          </div>
                        ))
                      ) : (
                        <div className={styles.insightCard}>
                          <span className={styles.insightBadge}>01</span>
                          <span className={styles.insightText}>
                            {result.feedback || "Resume successfully processed."}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </SpotlightBentoCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default withAuthHOC(Dashboard);
