import { useContext } from "react";
import styles from "./SideBar.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../utils/AuthContext";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  History as HistoryIcon,
  ShieldCheck,
  LogOut,
  Sparkles,
} from "lucide-react";

const SideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setLogin, userInfo, setUserinfo } = useContext(AuthContext);

  const handleLogout = () => {
    localStorage.clear();
    setLogin(false);
    setUserinfo(null);
    navigate("/");
  };

  const userInitial = userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : "U";

  return (
    <aside className={styles.dockContainer} aria-label="Spatial Navigation Dock">
      {/* Header & Brand Emblem */}
      <div className={styles.brandWrapper}>
        <div className={styles.telemetryRow}>
          <span className={styles.telemetryTag}>[ATS.OS v3.0]</span>
          <span>SYSTEM // ONLINE</span>
        </div>

        <div className={styles.brandGroup}>
          {/* Custom Geometric SVG Brand Emblem */}
          <div className={styles.brandEmblem} aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon
                points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"
                stroke="#06B6D4"
                strokeWidth="1.5"
                fill="rgba(6, 182, 212, 0.1)"
              />
              <line x1="12" y1="2" x2="12" y2="22" stroke="#6366F1" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="3.5" fill="#06B6D4" />
            </svg>
          </div>

          <div className={styles.brandTextGroup}>
            <span className={styles.brandTitle}>ScoreMyCV</span>
            <span className={styles.brandSubpill}>
              <Sparkles size={10} />
              AI ATS ARCHITECT
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className={styles.navGroup} aria-label="Main Navigation">
        <div className={styles.navSectionLabel}>NAVIGATION // WORKSPACE</div>

        <Link
          to="/dashboard"
          className={`${styles.navLink} ${
            location.pathname === "/dashboard" ? styles.navLinkActive : ""
          }`}
          data-interactive="true"
        >
          {location.pathname === "/dashboard" && (
            <motion.div
              layoutId="activeNavPill"
              className={styles.activeNavPill}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
            />
          )}
          <span className={styles.navNum}>01</span>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/history"
          className={`${styles.navLink} ${
            location.pathname === "/history" ? styles.navLinkActive : ""
          }`}
          data-interactive="true"
        >
          {location.pathname === "/history" && (
            <motion.div
              layoutId="activeNavPill"
              className={styles.activeNavPill}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
            />
          )}
          <span className={styles.navNum}>02</span>
          <HistoryIcon size={18} />
          <span>Scan History</span>
        </Link>

        {userInfo?.role === "admin" && (
          <Link
            to="/admin"
            className={`${styles.navLink} ${
              location.pathname === "/admin" ? styles.navLinkActive : ""
            }`}
            data-interactive="true"
          >
            {location.pathname === "/admin" && (
              <motion.div
                layoutId="activeNavPill"
                className={styles.activeNavPill}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <span className={styles.navNum}>03</span>
            <ShieldCheck size={18} />
            <span>Admin Console</span>
          </Link>
        )}
      </nav>

      {/* Footer: User Profile, Pulsing Online Dot & Sign Out */}
      <div className={styles.userFooter}>
        <div className={styles.userCard}>
          <div className={styles.userAvatarWrapper}>
            {userInfo?.photoUrl ? (
              <img
                src={userInfo.photoUrl}
                alt={userInfo?.name || "User Avatar"}
                className={styles.userAvatar}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={styles.userAvatarFallback}>{userInitial}</div>
            )}
            {/* Pulsing Green Online Dot */}
            <span className={styles.pulsingOnlineDot} title="Online Session" />
          </div>

          <div className={styles.userInfo}>
            <span className={styles.userName}>{userInfo?.name || "Active Member"}</span>
            <span className={styles.userEmail}>{userInfo?.email || "Authenticated"}</span>
          </div>
        </div>

        <motion.button
          onClick={handleLogout}
          className={styles.signOutBtn}
          type="button"
          aria-label="Sign Out of Session"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          data-interactive="true"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </aside>
  );
};

export default SideBar;
