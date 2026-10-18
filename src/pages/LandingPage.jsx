import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: "dashboard",
    eyebrow: "YOUR MONEY, AT A GLANCE",
    title: "Finance Dashboard",
    description:
      "See your income, expenses, budgets and spending trends together in one clear overview.",
    path: "/dashboard",
    action: "Explore dashboard",
  },
  {
    icon: "transactions",
    eyebrow: "EVERY RUPEE, ACCOUNTED FOR",
    title: "Transactions",
    description:
      "Review income and expenses, search your activity and understand where your money goes.",
    path: "/transactions",
    action: "Manage transactions",
  },
  {
    icon: "upload",
    eyebrow: "LESS MANUAL ENTRY",
    title: "Statement Import",
    description:
      "Import supported CSV statements and bring transaction data into your finance workspace.",
    path: "/import",
    action: "Import transactions",
  },
  {
    icon: "target",
    eyebrow: "PLAN WITH PURPOSE",
    title: "Financial Goals",
    description:
      "Set savings goals, track your progress and keep the next milestone in sight.",
    path: "/goals",
    action: "View goals",
  },
  {
    icon: "sparkles",
    eyebrow: "YOUR AI-POWERED COMPANION",
    title: "AI Finance Assistant",
    description:
      "Use a conversational assistant to get help with supported finance and task workflows.",
    path: "/chat",
    action: "Meet your assistant",
    featured: true,
  },
  {
    icon: "tasks",
    eyebrow: "TURN PLANS INTO ACTION",
    title: "Tasks & Planning",
    description:
      "Organize action items and keep your personal planning work moving forward.",
    path: "/tasks",
    action: "Organize tasks",
  },
  {
    icon: "bell",
    eyebrow: "STAY ON TOP OF THINGS",
    title: "Reminders",
    description:
      "Configure reminders and notification preferences to help you stay on track.",
    path: "/reminders",
    action: "Manage reminders",
  },
  {
    icon: "devices",
    eyebrow: "YOUR CONNECTED WORKSPACE",
    title: "Connected Devices",
    description:
      "Manage the device connections supported by your Finance Tracker account.",
    path: "/devices",
    action: "Manage devices",
  },
];

function FeatureIcon({ name, size = 24 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3.5" width="7.5" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7.5" height="4" rx="1.5" />
          <rect x="13.5" y="10" width="7.5" height="10.5" rx="1.5" />
          <rect x="3" y="13" width="7.5" height="7.5" rx="1.5" />
        </svg>
      );
    case "transactions":
      return (
        <svg {...common}>
          <path d="M4 7h15M15 3l4 4-4 4M20 17H5m4-4-4 4 4 4" />
        </svg>
      );
    case "upload":
      return (
        <svg {...common}>
          <path d="M12 15V3m-4 4 4-4 4 4" />
          <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...common}>
          <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
          <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15ZM5 2l.7 1.8L7.5 4.5l-1.8.7L5 7l-.7-1.8-1.8-.7 1.8-.7L5 2Z" />
        </svg>
      );
    case "tasks":
      return (
        <svg {...common}>
          <rect x="4" y="3.5" width="16" height="17" rx="2" />
          <path d="m8 9 1.5 1.5L12 8m2 1h3M8 15l1.5 1.5L12 14m2 1h3" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
        </svg>
      );
    case "devices":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="13" height="11" rx="1.5" />
          <path d="M7 19h5m-2-4v4" />
          <rect x="17" y="8" width="4" height="12" rx="1" />
        </svg>
      );
    default:
      return null;
  }
}

function DashboardPreview() {
  const months = [
    { label: "Jan", income: 44, expenses: 25 },
    { label: "Feb", income: 62, expenses: 34 },
    { label: "Mar", income: 52, expenses: 30 },
    { label: "Apr", income: 76, expenses: 42 },
    { label: "May", income: 66, expenses: 37 },
    { label: "Jun", income: 91, expenses: 47 },
  ];

  return (
    <div className="finora-preview-wrap" aria-label="Illustrative dashboard preview with sample figures">
      <div className="finora-preview-glow" />
      <div className="finora-preview-window">
        <div className="finora-preview-topline">
          <div className="finora-window-dots" aria-hidden="true">
            <i /><i /><i />
          </div>
          <span className="finora-preview-label">FINORA · OVERVIEW</span>
          <span className="finora-preview-avatar">M</span>
        </div>

        <div className="finora-preview-content">
          <div className="finora-preview-heading">
            <div>
              <p className="finora-preview-kicker">MONDAY, YOUR MONEY CHECK-IN</p>
              <h2>Your finances, in focus.</h2>
            </div>
            <span className="finora-preview-period">This month⌄</span>
          </div>

          <div className="finora-preview-balance">
            <div>
              <span className="finora-preview-muted">Total balance <span className="finora-preview-eye">◉</span></span>
              <strong>₹1,24,500</strong>
              <span className="finora-preview-change"><span>↗</span> Your illustrative overview</span>
            </div>
            <div className="finora-balance-mark" aria-hidden="true">₹</div>
          </div>

          <div className="finora-preview-metrics">
            <div className="finora-mini-metric">
              <span className="finora-metric-icon finora-income-icon">↙</span>
              <span className="finora-preview-muted">Income</span>
              <strong>₹68,400</strong>
              <small>Sample figure</small>
            </div>
            <div className="finora-mini-metric">
              <span className="finora-metric-icon finora-expense-icon">↗</span>
              <span className="finora-preview-muted">Expenses</span>
              <strong>₹32,780</strong>
              <small>Sample figure</small>
            </div>
          </div>

          <div className="finora-preview-lower">
            <div className="finora-chart-card">
              <div className="finora-preview-card-heading">
                <div>
                  <strong>Money flow</strong>
                  <span>Illustrative monthly trends</span>
                </div>
                <span className="finora-chart-menu">•••</span>
              </div>
              <div className="finora-chart">
                <div className="finora-chart-guides"><i /><i /><i /></div>
                {months.map((month) => (
                  <div className="finora-chart-month" key={month.label}>
                    <div className="finora-chart-bars">
                      <span className="finora-chart-bar income" style={{ height: `${month.income}%` }} />
                      <span className="finora-chart-bar expense" style={{ height: `${month.expenses}%` }} />
                    </div>
                    <span>{month.label}</span>
                  </div>
                ))}
              </div>
              <div className="finora-chart-legend">
                <span><i className="income-dot" /> Income</span>
                <span><i className="expense-dot" /> Expenses</span>
              </div>
            </div>

            <div className="finora-goal-card">
              <div className="finora-goal-icon"><FeatureIcon name="target" size={19} /></div>
              <span className="finora-preview-muted">Savings goal</span>
              <strong>New laptop</strong>
              <div className="finora-goal-amount"><b>₹24,000</b><span>of ₹40,000</span></div>
              <div className="finora-goal-track"><span /></div>
              <small>60% of your sample goal</small>
            </div>
          </div>
        </div>
      </div>

      <div className="finora-floating-note">
        <span className="finora-floating-note-icon"><FeatureIcon name="sparkles" size={18} /></span>
        <span><strong>A little clarity goes a long way.</strong><small>Plan your next money move.</small></span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const primaryPath = user ? "/dashboard" : "/signup";

  return (
    <main className="finora-page">
      <header className="finora-header">
        <div className="finora-nav-inner">
          <Link to="/" className="finora-brand" aria-label="Finora home">
            <span className="finora-brand-mark">f</span>
            <span className="finora-brand-word">finora<span>.</span><small>PERSONAL FINANCE, MADE SMARTER</small></span>
          </Link>

          <nav className="finora-main-nav" aria-label="Main navigation">
            <a href="#features">Features</a>
            <a href="#ai-assistant">AI assistant</a>
            <a href="#how-it-works">How it works</a>
          </nav>

          <div className="finora-nav-actions">
            {user ? (
              <Link to="/dashboard" className="finora-button finora-button-primary finora-nav-cta">
                Open dashboard <span aria-hidden="true">↗</span>
              </Link>
            ) : (
              <>
                <Link to="/login" className="finora-login-link">Log in</Link>
                <Link to="/signup" className="finora-button finora-button-primary finora-nav-cta">
                  Get started <span aria-hidden="true">↗</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="finora-hero">
        <div className="finora-hero-orb finora-orb-one" />
        <div className="finora-hero-orb finora-orb-two" />
        <div className="finora-container finora-hero-grid">
          <div className="finora-hero-copy">
            <div className="finora-pill"><span className="finora-pill-spark">✦</span> A calmer way to manage money</div>
            <h1>Your money.<br />Your goals.<br /><em>Your next move.</em></h1>
            <p className="finora-hero-description">
              Get a clearer picture of your finances, build toward what matters, and bring your everyday planning together with an AI-powered assistant.
            </p>
            <div className="finora-hero-actions">
              <Link to={primaryPath} className="finora-button finora-button-primary finora-button-large">
                {user ? "Go to your dashboard" : "Start your free account"}<span aria-hidden="true">↗</span>
              </Link>
              <a href="#features" className="finora-button finora-button-secondary finora-button-large">
                Explore features <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="finora-hero-footnote"><span className="finora-footnote-check">✓</span> Transactions, goals, reminders and AI assistance in one workspace.</div>
          </div>

          <div className="finora-hero-visual">
            <DashboardPreview />
          </div>
        </div>
        <div className="finora-hero-bottom-line" />
      </section>

      <section className="finora-value-strip" aria-label="Finora highlights">
        <div className="finora-container finora-value-grid">
          <div><span className="finora-value-icon">◫</span><span><strong>See the bigger picture</strong><small>Income, expenses and trends</small></span></div>
          <div><span className="finora-value-icon">◎</span><span><strong>Keep goals in reach</strong><small>Progress you can follow</small></span></div>
          <div><span className="finora-value-icon">✦</span><span><strong>Plan with AI assistance</strong><small>Conversation meets action</small></span></div>
        </div>
      </section>

      <section className="finora-section finora-features-section" id="features">
        <div className="finora-container">
          <div className="finora-section-heading">
            <div>
              <p className="finora-eyebrow">YOUR FINANCIAL TOOLKIT</p>
              <h2>All the moving pieces.<br /><em>One clearer picture.</em></h2>
            </div>
            <p className="finora-section-intro">From tracking what comes in and goes out to organizing goals and reminders, Finora brings your personal finance workflow into one place.</p>
          </div>

          <div className="finora-feature-grid">
            {features.map((feature, index) => (
              <article className={`finora-feature-card${feature.featured ? " finora-feature-card-highlight" : ""}`} key={feature.path}>
                <div className="finora-feature-card-top">
                  <span className="finora-feature-icon"><FeatureIcon name={feature.icon} /></span>
                  <span className="finora-feature-number">0{index + 1}</span>
                </div>
                <p className="finora-feature-eyebrow">{feature.eyebrow}</p>
                <h3>{feature.title}</h3>
                <p className="finora-feature-description">{feature.description}</p>
                <Link className="finora-feature-link" to={user ? feature.path : "/signup"}>
                  {user ? feature.action : "Get started to explore"}<span aria-hidden="true">↗</span>
                </Link>
              </article>
            ))}
          </div>
          <p className="finora-feature-footnote">Feature access depends on signing in. The dashboard preview above uses sample figures for illustration.</p>
        </div>
      </section>

      <section className="finora-ai-section" id="ai-assistant">
        <div className="finora-container finora-ai-grid">
          <div className="finora-ai-visual">
            <div className="finora-ai-orbit finora-ai-orbit-one" />
            <div className="finora-ai-orbit finora-ai-orbit-two" />
            <div className="finora-ai-card">
              <div className="finora-ai-card-header"><span className="finora-ai-avatar"><FeatureIcon name="sparkles" size={21} /></span><span><strong>Finora assistant</strong><small>Conversation for your next step</small></span><i /></div>
              <div className="finora-chat-bubble user-bubble">Help me get organized this month.</div>
              <div className="finora-chat-bubble assistant-bubble"><span className="finora-chat-spark">✦</span><span>Let's bring your money picture, goals and next actions into focus. What would you like to work on first?</span></div>
              <div className="finora-ai-suggestions"><span>Review spending</span><span>Plan a goal</span><span>Organize tasks</span></div>
              <div className="finora-ai-input"><span>Ask Finora something...</span><b>↑</b></div>
              <p className="finora-ai-demo-note">Illustrative conversation preview</p>
            </div>
          </div>

          <div className="finora-ai-copy">
            <p className="finora-eyebrow">MORE THAN A TRACKER</p>
            <h2>Meet the assistant that helps you <em>move forward.</em></h2>
            <p>Finora pairs everyday finance tools with a conversational AI experience, helping you navigate supported finance and task workflows without jumping between disconnected screens.</p>
            <div className="finora-ai-points">
              <div><span>01</span><p><strong>Start with a conversation</strong><small>Describe the question or task you want help with.</small></p></div>
              <div><span>02</span><p><strong>Bring your workflow together</strong><small>Use the assistant alongside your finance and planning tools.</small></p></div>
              <div><span>03</span><p><strong>Keep your next step visible</strong><small>Continue in the relevant section of your workspace.</small></p></div>
            </div>
            <Link to={user ? "/chat" : "/signup"} className="finora-text-link">{user ? "Open AI assistant" : "Get started with Finora"}<span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <section className="finora-section finora-how-section" id="how-it-works">
        <div className="finora-container">
          <div className="finora-section-heading finora-section-heading-centered">
            <div><p className="finora-eyebrow">SIMPLE BY DESIGN</p><h2>Start where you are.<br /><em>Build from there.</em></h2></div>
            <p className="finora-section-intro">No complicated setup story. Start with the tools you need today and explore more as your routine takes shape.</p>
          </div>
          <div className="finora-steps-grid">
            <article className="finora-step"><span className="finora-step-number">01</span><span className="finora-step-symbol">↗</span><h3>Get your money organized</h3><p>Review transactions and bring supported CSV statement data into your workspace.</p></article>
            <article className="finora-step"><span className="finora-step-number">02</span><span className="finora-step-symbol">◎</span><h3>Set your next milestone</h3><p>Create goals, monitor progress, and organize the actions that help you move forward.</p></article>
            <article className="finora-step"><span className="finora-step-number">03</span><span className="finora-step-symbol">✦</span><h3>Keep your plan moving</h3><p>Use the AI assistant, tasks and reminders to support your day-to-day workflow.</p></article>
          </div>
        </div>
      </section>

      <section className="finora-final-cta">
        <div className="finora-container finora-final-cta-inner">
          <div className="finora-cta-mark" aria-hidden="true">f<span>.</span></div>
          <p className="finora-eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
          <h2>Make room for better<br /><em>money decisions.</em></h2>
          <p>Bring your transactions, goals and plans into focus—with a little help from AI.</p>
          <Link to={primaryPath} className="finora-button finora-button-light finora-button-large">{user ? "Open your dashboard" : "Create your Finora account"}<span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <footer className="finora-footer">
        <div className="finora-container finora-footer-inner">
          <Link to="/" className="finora-brand" aria-label="Finora home"><span className="finora-brand-mark">f</span><span className="finora-brand-word">finora<span>.</span><small>PERSONAL FINANCE, MADE SMARTER</small></span></Link>
          <p>A little more clarity. One step at a time.</p>
          <div className="finora-footer-links"><a href="#features">Features</a><Link to="/login">Log in</Link><Link to="/signup">Sign up</Link></div>
        </div>
      </footer>
    </main>
  );
}
