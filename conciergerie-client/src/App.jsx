import logo from "./assets/optimistic.png";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="header__inner">
          <div className="brand">
            <img className="brand__logo" src={logo} alt="Logo Optimistic Conciergerie" />
            {/*<div className="brand__text">
              <div className="brand__name">Optimistic</div>
              <div className="brand__tagline">Conciergerie</div>
            </div>*/}
          </div>

          <nav className="nav">
            <a href="#services" className="nav__link">Services</a>
           {/* <a href="#apropos" className="nav__link">À propos</a> */}
            <a href="#contact" className="nav__link nav__cta">Contact</a>
          </nav>
        </div>
      </header>

      <main className="container">
        <section className="hero" id="apropos">
          <div className="hero__content">
            <h1 className="hero__title">Une conciergerie pensée pour rassurer les investisseurs.</h1>
            <p className="hero__subtitle">
              Process clairs, suivi rigoureux et communication transparente — pour une gestion sereine.
            </p>

            <div className="hero__actions">
              <button className="btn btn--primary">Demander un rendez-vous</button>
              <button className="btn btn--ghost">Découvrir nos services</button>
            </div>
          </div>

          <div className="hero__panel">
            <div className="panel">
              <div className="panel__title">Ce que vous obtenez</div>
              <ul className="panel__list">
                <li>Reporting régulier</li>
                <li>Interlocuteur dédié</li>
                <li>Procédures & traçabilité</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section" id="services">
          <h2 className="section__title">Services</h2>

          <div className="cards">
            <article className="card">
              <h3 className="card__title">Suivi & reporting</h3>
              <p className="card__text">Des points réguliers, des chiffres clairs, une visibilité constante.</p>
            </article>

            <article className="card">
              <h3 className="card__title">Gestion opérationnelle</h3>
              <p className="card__text">Coordination, prestataires, contrôle qualité et résolution rapide.</p>
            </article>

            <article className="card">
              <h3 className="card__title">Conformité & sécurité</h3>
              <p className="card__text">Process, check-lists, traçabilité — pour réduire les risques.</p>
            </article>
          </div>
        </section>

        <section className="section" id="contact">
          <h2 className="section__title">Contact</h2>
          <div className="contact">
            <input className="input" placeholder="Votre email" />
            <button className="btn btn--primary">Être rappelé</button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <span>© {new Date().getFullYear()} Optimistic Conciergerie</span>
          <span className="muted">Confiance • Sérénité • Exigence</span>
        </div>
      </footer>
    </div>
  );
}