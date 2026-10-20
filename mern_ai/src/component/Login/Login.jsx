import { useContext, useState, useEffect } from "react";
import styles from "./Login.module.css";
import { auth, provider } from "../../utils/firebase";
import { signInWithPopup } from "firebase/auth";
import { AuthContext } from "../../utils/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import { motion } from "framer-motion";
import SpotlightBentoCard from "../ui/SpotlightBentoCard";
import SplineScene3D from "../three/SplineScene3D";
import { Loader2, CheckCircle2 } from "lucide-react";

const Login = () => {
  const { setLogin, setUserinfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Existing redirect check if authenticated session exists
  useEffect(() => {
    const isLogin = localStorage.getItem("isLogin");
    if (isLogin === "true" || isLogin === true) {
      navigate("/dashboard");
    }
  }, [navigate]);

  // Exact Firebase & Backend registration logic preserved 100%
  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userData = {
        name: user.displayName,
        email: user.email,
        photoUrl: user.photoURL,
      };

      try {
        const response = await axios.post("/api/user", userData);
        if (response?.data?.user) {
          setUserinfo(response.data.user);
          localStorage.setItem("userInfo", JSON.stringify(response.data.user));
        } else {
          setUserinfo(userData);
          localStorage.setItem("userInfo", JSON.stringify(userData));
        }
      } catch (err) {
        console.warn("Backend user registration note:", err);
        setUserinfo(userData);
        localStorage.setItem("userInfo", JSON.stringify(userData));
      }

      setLogin(true);
      localStorage.setItem("isLogin", true);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMsg("Authentication failed. Please check your network or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      {/* 1. Top full-width 1px bordered Swiss status ticker */}
      <header className={styles.statusTickerBar} aria-label="System Status Ticker">
        <div className={styles.tickerGroup}>
          <span className={styles.tickerItem}>
            <span className={styles.dotOnline} />
            [SYSTEM: ONLINE]
          </span>
          <span className={styles.tickerDotSep}>•</span>
          <span className={styles.tickerItem}>
            [ENGINE: <span className={styles.tickerHighlight}>COHERE AI LLM</span>]
          </span>
          <span className={styles.tickerDotSep}>•</span>
          <span className={styles.tickerItem}>
            [MODULE: <span className={styles.tickerHighlight}>PDF VECTOR PARSER</span>]
          </span>
        </div>
        <div className={styles.tickerGroup}>
          <span>LATENCY // 38MS</span>
          <span className={styles.tickerDotSep}>•</span>
          <span>ATS MATRIX PROTOCOL v3.0</span>
        </div>
      </header>

      {/* 2. Asymmetric Two-Column Hero Grid */}
      <main className={styles.heroViewport}>
        {/* Left Column: Swiss Editorial Value Prop & Authentication Box */}
        <section className={styles.leftCol}>
          {/* Monospace Section Label */}
          <div className={styles.sectionLabel}>
            <span>[01 // AI CAREER INTELLIGENCE]</span>
          </div>

          {/* Oversized display heading in 'Syne' */}
          <h1 className={styles.oversizedHeading}>
            ARCHITECT YOUR RESUME FOR THE{" "}
            <span className={styles.headingGradient}>ATS MATRIX.</span>
          </h1>

          <p className={styles.subHeroText}>
            Over 75% of qualified resumes get filtered out silently before reaching human
            recruiters. ScoreMyCV leverages Cohere AI vector embeddings to analyze semantic
            relevance, structural keyword density, and precision ATS benchmarks.
          </p>

          {/* Three Numbered Capability Blocks */}
          <div className={styles.capabilityList}>
            <div className={styles.capabilityCard}>
              <span className={styles.capNumber}>01 /</span>
              <span className={styles.capTitle}>Instant PDF Binary Extraction</span>
            </div>
            <div className={styles.capabilityCard}>
              <span className={styles.capNumber}>02 /</span>
              <span className={styles.capTitle}>Cohere LLM Semantic Benchmarking</span>
            </div>
            <div className={styles.capabilityCard}>
              <span className={styles.capNumber}>03 /</span>
              <span className={styles.capTitle}>Actionable Rewrite Telemetry</span>
            </div>
          </div>

          {/* Authentication Box in SpotlightBentoCard */}
          <SpotlightBentoCard>
            <div className={styles.authBentoCard}>
              <div className={styles.authCardHeader}>
                <span className={styles.authBadge}>
                  <CheckCircle2 size={12} />
                  GOOGLE OAUTH 2.0
                </span>
                <span className="telemetry-tag">[SESSION // ENCRYPTED]</span>
              </div>

              <p className={styles.authCardTitle}>
                Establish your session to start analyzing your resumes against live enterprise job
                descriptions.
              </p>

              {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

              {/* Magnetic Continue with Google Button with Animated Conic-Gradient Border Beam */}
              <div className={styles.googleBtnWrapper}>
                <div className={styles.conicBorderBeam} />
                <motion.button
                  onClick={handleLogin}
                  disabled={loading}
                  className={styles.googleBtn}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  data-interactive="true"
                  aria-label="Continue with Google Authentication"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Authenticating Secure Session...</span>
                    </>
                  ) : (
                    <>
                      {/* Official Multi-Color Google SVG Icon */}
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </SpotlightBentoCard>
        </section>

        {/* Right Column: 3D Spline Scene Centerpiece & 3 Orbiting HUD Badges */}
        <section className={styles.rightCol} aria-label="3D Interactive Centerpiece Stage">
          <SpotlightBentoCard style={{ width: "100%" }}>
            <div className={styles.stageCard}>
              <div className={styles.stageHeader}>
                <span>[3D // REALTIME MODEL]</span>
                <span>SPATIAL CORE v3.0</span>
              </div>

              {/* 3 Floating depth-z-2 Glass HUD Badges Orbiting the 3D Core */}
              <div className={`${styles.hudBadge} ${styles.hudBadge1} depth-z-2`}>
                <span className={styles.hudDotEmerald} />
                <span>96.4% ATS Match</span>
              </div>

              <div className={`${styles.hudBadge} ${styles.hudBadge2} depth-z-2`}>
                <span className={styles.hudDotCyan} />
                <span>PDF Layer Verified</span>
              </div>

              <div className={`${styles.hudBadge} ${styles.hudBadge3} depth-z-2`}>
                <span className={styles.hudDotViolet} />
                <span>Cohere Vector Ready</span>
              </div>

              {/* Central 3D Sculpture */}
              <SplineScene3D isScanning={false} compact={false} />
            </div>
          </SpotlightBentoCard>
        </section>
      </main>
    </div>
  );
};

export default Login;
