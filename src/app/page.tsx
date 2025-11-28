import Link from "next/link";
import { Button } from "@/components/ui/button";

const menus = [
  {
    title: "恋愛相談",
    description: "失恋・片思い・復縁など恋の痛みを丁寧に傾聴し、本当の感情に気づく鏡になります。",
    emoji: "💕",
  },
  {
    title: "人生相談",
    description: "キャリアや生き方の迷いに寄り添い、" +
      "『今日生きててよかった』と思える瞬間を見つける伴走者です。",
    emoji: "🌟",
  },
  {
    title: "人間関係相談",
    description:
      "職場・家族・友人の境界線を整え、ノージャッジで心の距離を取り戻すお手伝いをします。",
    emoji: "👥",
  },
];

const roadmap = [
  {
    label: "Phase 1",
    title: "MVP: 認証 + AIチャット + 課金",
    detail: "3カテゴリの鏡型対話とサブスク課金を最速で提供",
  },
  {
    label: "Phase 2",
    title: "タイプ診断 & 履歴管理",
    detail: "診断ファネルと過去セッション再開でリテンションを強化",
  },
  {
    label: "Phase 3",
    title: "本番運用・監視",
    detail: "SLO達成のための最適化と安全運用フローを実装",
  },
];

export default function Home() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-background to-secondary/30">
      {/* Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-4 sm:px-12">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold font-serif italic text-primary tracking-tight">
            Michelle
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            ミシェルについて
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            料金プラン
          </Link>
          <Button variant="ghost" className="text-sm" asChild>
            <Link href="/login">ログイン</Link>
          </Button>
          <Button className="rounded-full px-5 text-sm" asChild>
            <Link href="/chat">相談を始める</Link>
          </Button>
        </nav>
        <Button className="md:hidden rounded-full px-4 text-xs" asChild>
          <Link href="/chat">相談する</Link>
        </Button>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-16 sm:px-8 lg:px-12">
        <section className="flex flex-col gap-6 rounded-3xl border bg-card/80 px-8 py-14 shadow-lg shadow-primary/5 sm:px-12">
          <p className="text-sm font-medium uppercase tracking-[0.4em] text-primary">
            TapeAI / テープ式心理学AI
          </p>
          <h1 className="text-3xl font-semibold leading-snug text-foreground sm:text-4xl lg:text-5xl">
            恋愛相談から始まる、ほんとうの自己理解体験
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            表向きは恋愛相談AI。実態はテープ式心理学に基づいた本格カウンセリング。問いかけ中心の
            「鏡」として、ネガティブの根っこに静かに寄り添います。
          </p>
          <div className="flex flex-wrap gap-4">
            <Button className="rounded-full px-6">
              まずは恋愛相談を体験する
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-border px-6 text-foreground"
            >
              開発ロードマップを見る
            </Button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {menus.map((menu) => (
            <article
              key={menu.title}
              className="flex flex-col gap-4 rounded-2xl border bg-card/70 p-6 shadow-sm shadow-primary/10"
            >
              <span className="text-4xl" aria-hidden>
                {menu.emoji}
              </span>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{menu.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{menu.description}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border bg-card/80 p-6 sm:p-10">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-primary">Development Plan</p>
            <h3 className="text-2xl font-semibold text-foreground sm:text-3xl">
              Phase 0 → Phase 3 までのロードマップ
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              {roadmap.map((phase) => (
                <article key={phase.label} className="rounded-2xl border bg-background/70 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {phase.label}
                  </p>
                  <h4 className="mt-3 text-lg font-semibold text-foreground">{phase.title}</h4>
                  <p className="mt-2 text-sm text-muted-foreground">{phase.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
