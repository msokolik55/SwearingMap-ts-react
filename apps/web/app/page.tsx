import Link from "next/link";

const capabilities = [
	{
		eyebrow: "Explore",
		title: "Language on a living map",
		body: "Move across countries and discover how the same emotion takes a different verbal shape.",
	},
	{
		eyebrow: "Understand",
		title: "Strength with context",
		body: "Future ratings and cultural notes will help distinguish playful slang from language that crosses a line.",
	},
	{
		eyebrow: "Learn",
		title: "From curiosity to recall",
		body: "Translations, equivalents, and language quizzes will turn exploration into practical memory.",
	},
];

const roadmap = [
	"Community vocabulary",
	"Cross-language equivalents",
	"Practice quizzes",
];

export default function Home() {
	return (
		<main>
			<header className="site-header">
				<Link className="brand" href="/" aria-label="Swearing Map home">
					<span className="brand-mark" aria-hidden="true">
						SM
					</span>
					<span>Swearing Map</span>
				</Link>
				<nav aria-label="Primary navigation">
					<a href="#why">Why it matters</a>
					<a href="#roadmap">Roadmap</a>
					<a className="nav-cta" href="/map/">
						Open map
					</a>
				</nav>
			</header>

			<section className="hero" aria-labelledby="hero-title">
				<div className="hero-copy">
					<p className="kicker">
						The world speaks in shades, not dictionaries.
					</p>
					<h1 id="hero-title">
						Learn the language people use when the polite words run out.
					</h1>
					<p className="hero-summary">
						Swearing Map is becoming a community-powered guide to expressive
						language, cultural context, and memorable practice.
					</p>
					<div className="hero-actions">
						<a className="button button-primary" href="/map/">
							Explore the live map
							<span aria-hidden="true">↗</span>
						</a>
						<a className="button button-secondary" href="#why">
							See what is coming
						</a>
					</div>
					<p className="release-note">
						<span aria-hidden="true" />
						Live proof of concept · Product platform in active development
					</p>
				</div>

				<div className="hero-visual" aria-label="Product preview">
					<div className="orbit orbit-large" />
					<div className="orbit orbit-small" />
					<div className="globe">
						<span className="coordinate coordinate-top">48.1° N</span>
						<span className="coordinate coordinate-bottom">17.1° E</span>
						<div className="pin pin-one">
							<span />
							<strong>Slovakia</strong>
							<small>Central Europe</small>
						</div>
						<div className="pin pin-two" aria-hidden="true">
							<span />
						</div>
						<div className="pin pin-three" aria-hidden="true">
							<span />
						</div>
					</div>
				</div>
			</section>

			<section className="capabilities" id="why" aria-labelledby="why-title">
				<div className="section-heading">
					<p className="eyebrow">Built beyond a directory</p>
					<h2 id="why-title">Context makes vocabulary useful.</h2>
				</div>
				<div className="card-grid">
					{capabilities.map((capability, index) => (
						<article className="capability-card" key={capability.title}>
							<span className="card-number">0{index + 1}</span>
							<p>{capability.eyebrow}</p>
							<h3>{capability.title}</h3>
							<div className="card-divider" />
							<p className="card-body">{capability.body}</p>
						</article>
					))}
				</div>
			</section>

			<section className="roadmap" id="roadmap" aria-labelledby="roadmap-title">
				<div>
					<p className="eyebrow">The next landmarks</p>
					<h2 id="roadmap-title">A platform designed to keep growing.</h2>
				</div>
				<ol>
					{roadmap.map((item, index) => (
						<li key={item}>
							<span>{index + 1}</span>
							{item}
						</li>
					))}
				</ol>
			</section>

			<footer>
				<span>Swearing Map</span>
				<p>Language is culture in motion.</p>
				<a href="/map/">Start exploring →</a>
			</footer>
		</main>
	);
}
