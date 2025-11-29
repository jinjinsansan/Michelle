"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  // Single video as requested
  const videoSrc = "/woman_beach_back_view.mp4";

  return (
    <>
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Hero Section (Video Background) */}
      <section className="relative isolate flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-[#D1E9FF]">
        {/* 1. Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-100"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        {/* 2. Background Overlay Layer (Screen Blend) */}
        {/* This creates the base blue tint over the video where text isn't present */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#D1E9FF] mix-blend-screen">
          <div className="container flex flex-col items-center gap-12 py-24 text-center">
             {/* Title Block (VISIBLE) - Determines layout */}
            <div className="flex flex-col items-center">
              <h1 className="font-heading text-[clamp(3.5rem,22vw,15rem)] font-bold leading-none tracking-tighter text-black">
                Michelle
              </h1>
              <p className="mt-16 text-[clamp(1.2rem,4vw,4rem)] font-heading font-medium tracking-widest text-black">
                ミシェル
              </p>
            </div>
            {/* SPACER */}
            <div className="flex flex-col items-center gap-8 opacity-0">
              <p className="text-lg md:text-2xl font-heading font-bold tracking-wide leading-relaxed">
                特定心理学特化型AI<br />
                全ての答えは内側に在り
              </p>
              <Button size="lg" className="h-16 px-12 text-xl">
                LINEで始める
              </Button>
            </div>
          </div>
        </div>

        {/* 3. Cutout Title Layer (Lighten Blend) */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none bg-[#D1E9FF] mix-blend-lighten">
          <div className="container flex flex-col items-center gap-12 py-24 text-center">
             {/* Title Block (VISIBLE) */}
            <div className="flex flex-col items-center">
              <h1 className="font-heading text-[clamp(3.5rem,22vw,15rem)] font-bold leading-none tracking-tighter text-black mix-blend-destination-out">
                Michelle
              </h1>
              <p className="mt-16 text-[clamp(1.2rem,4vw,4rem)] font-heading font-medium tracking-widest text-black mix-blend-destination-out">
                ミシェル
              </p>
            </div>
             {/* SPACER */}
            <div className="flex flex-col items-center gap-8 opacity-0">
              <p className="text-lg md:text-2xl font-heading font-medium tracking-wide">
                特定心理学特化型AI<br />
                全ての答えは内側に在り
              </p>
              <Button size="lg" className="h-16 rounded-full px-12 text-xl">
                LINEで始める
              </Button>
            </div>
          </div>
        </div>

        {/* 4. Foreground Content Layer (Normal Blend) */}
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none">
          <div className="container flex flex-col items-center gap-12 py-24 text-center">
             {/* SPACER */}
            <div className="flex flex-col items-center opacity-0">
              <h1 className="font-heading text-[clamp(3.5rem,22vw,15rem)] font-bold leading-none tracking-tighter">
                Michelle
              </h1>
              <p className="mt-16 text-[clamp(1.2rem,4vw,4rem)] font-heading font-medium tracking-widest">
                ミシェル
              </p>
            </div>

            {/* Visible Description & Button */}
            <div className="flex flex-col items-center gap-8 pointer-events-auto">
              <p className="text-lg md:text-2xl text-primary font-heading font-bold tracking-wide drop-shadow-sm leading-relaxed">
                特定心理学特化型AI<br />
                全ての答えは内側に在り
              </p>

              <Button
                size="lg"
                className="h-16 rounded-full bg-white px-12 text-xl font-heading font-bold text-primary shadow-xl transition-all hover:scale-105 hover:bg-white/90"
                asChild
              >
                <Link href="/chat">LINEで始める</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FADE TO BLACK OVERLAY (New) */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-[60] pointer-events-none"></div>
    </div>

    {/* 
      =============================================
      LANDING PAGE CONTENT
      =============================================
    */}
    <div className="relative z-50 bg-black text-white selection:bg-blue-500 selection:text-white">
      
      {/* Connecting Section: The Hook */}
      <section className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden px-4 text-center py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black"></div>
        
        <div className="space-y-6">
          <p className="text-sm font-bold tracking-[0.5em] text-blue-500 uppercase animate-pulse">WHY MICHELLE?</p>
          <h2 className="font-heading text-4xl font-black leading-none tracking-tight md:text-6xl lg:text-7xl">
            ただの「共感」は、<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              もう要らない。
            </span>
          </h2>
          <p className="mx-auto max-w-md text-lg text-gray-400 md:text-xl leading-relaxed [text-wrap:balance]">
            一般的なAIは、耳障りの良い言葉を並べるだけ。<br className="hidden md:block" />
            ミシェルは違います。<br className="hidden md:block" />
            膨大な心理学ナレッジと独自のカウンセリング手法で、<br className="hidden md:block" />
            あなたの悩みの「根本原因」へ、確実に辿り着きます。
          </p>
        </div>
      </section>

      {/* Step 1: Knowledge (RAG) */}
      <section className="relative py-16 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:gap-12 md:grid-cols-2 md:items-center">
            <div className="relative aspect-square w-full max-w-[300px] md:max-w-md mx-auto rounded-3xl bg-gradient-to-br from-blue-950 to-blue-900 border border-blue-800 p-8 flex items-center justify-center shadow-2xl shadow-blue-500/40">
              <div className="text-7xl md:text-9xl animate-pulse">🧠</div>
              <div className="absolute -top-4 -right-4 bg-cyan-500 text-black px-4 py-1 md:px-6 md:py-2 text-lg md:text-xl font-bold rounded-full transform rotate-12 shadow-lg">
                世界初の実装
              </div>
            </div>
            <div className="space-y-4 md:space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
              <div className="inline-block rounded-full bg-gray-900 px-4 py-1 text-sm font-bold text-gray-400 border border-gray-800">
                REASON 01
              </div>
              <h2 className="text-3xl font-black md:text-6xl">
                圧倒的な<br />
                <span className="text-blue-400">専門知識量。</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed [text-wrap:balance]">
                ミシェルには、特定の心理学領域における<br className="inline md:hidden" />膨大なナレッジ(RAG)が搭載されています。<br className="hidden md:inline" />
                表面的なアドバイスではなく、<br className="inline md:hidden" />心の仕組みに基づいた<br className="inline md:hidden" />「論理的で納得感のある」対話が可能です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 2: Methodology (Goal-Oriented) */}
      <section className="relative py-16 md:py-32 bg-gray-950/50">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:gap-12 md:grid-cols-2 md:items-center md:flex-row-reverse">
            <div className="md:order-2 relative aspect-square w-full max-w-[300px] md:max-w-md mx-auto rounded-3xl bg-gradient-to-br from-cyan-950 to-cyan-900 border border-cyan-800 p-8 flex flex-col items-center justify-center shadow-2xl shadow-cyan-500/40 text-center">
              <div className="text-7xl md:text-8xl mb-4">🎯</div>
              <div className="text-xl md:text-2xl font-bold text-white">ただ話すだけじゃない</div>
              <div className="text-cyan-300 font-black text-3xl md:text-4xl">「ゴール」がある</div>
            </div>
            <div className="space-y-4 md:space-y-6 md:order-1 text-center md:text-left flex flex-col items-center md:items-start">
              <div className="inline-block rounded-full bg-gray-900 px-4 py-1 text-sm font-bold text-gray-400 border border-gray-800">
                REASON 02
              </div>
              <h2 className="text-3xl font-black md:text-6xl">
                独自の<br />
                <span className="text-cyan-400">解決メソッド。</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed [text-wrap:balance]">
                延々と愚痴を聞くだけのAIとは違います。<br />
                <br />
                ミシェルは、独自のカウンセリング手法を用い、<br className="inline md:hidden" />対話を通じてあなたを「気づき」へと導きます。<br className="inline md:hidden" />そこには明確なゴールが存在します。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3: Mirror (Reflection) */}
      <section className="relative py-16 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:gap-12 md:grid-cols-2 md:items-center">
            <div className="relative w-full max-w-[300px] md:max-w-md mx-auto">
              {/* Card Stack Effect */}
              <div className="absolute top-0 left-0 w-full h-full bg-blue-800 rounded-3xl transform rotate-6 opacity-30"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-blue-700 rounded-3xl transform -rotate-3 opacity-40"></div>
              <div className="relative rounded-3xl bg-gradient-to-br from-blue-950 to-indigo-950 p-6 text-white shadow-2xl shadow-blue-500/30 border border-blue-800 transform transition-transform hover:scale-105">
                <div className="flex items-center justify-center mb-4">
                  <div className="text-6xl">🧘</div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-center text-blue-100">AIは「鏡」になる</h3>
                <p className="text-xs md:text-sm text-blue-200/80 mt-4 leading-loose text-center [text-wrap:balance]">
                  あなたの言葉の裏にある<br />
                  「本当の感情」や「思い込み」を映し出す。<br />
                  <span className="font-bold text-cyan-300">答えは全て、あなたの内側にあります。</span>
                </p>
              </div>
            </div>
            <div className="space-y-4 md:space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
              <div className="inline-block rounded-full bg-gray-900 px-4 py-1 text-sm font-bold text-gray-400 border border-gray-800">
                REASON 03
              </div>
              <h2 className="text-3xl font-black md:text-6xl">
                世界でたった一つの<br />
                <span className="text-blue-400">自己理解体験。</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed [text-wrap:balance]">
                他人の意見に左右されるのは終わりです。<br />
                <br />
                ミシェルとの対話は、自分自身との対話。<br className="inline md:hidden" />あなただけの答えを見つける旅が、<br className="inline md:hidden" />ここから始まります。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Warning Section: 表面的な対話では、何も変わらない */}
      <section className="relative py-24 md:py-32 bg-blue-950/20 border-y border-blue-900/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-900/30 px-6 py-2 text-sm font-bold text-blue-400 border border-blue-900/50">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              WARNING
            </div>
            <h2 className="text-4xl font-black md:text-7xl">
              表面的な対話では、<br />
              <span className="text-blue-400">何も変わらない。</span>
            </h2>
            <p className="text-xl text-blue-200/80 leading-relaxed [text-wrap:balance]">
              慰めてもらうだけでは、<br className="inline md:hidden" />問題は解決しません。<br />
              ミシェルは、あなたが「本当に向き合うべきこと」を<br className="inline md:hidden" />見つけ出します。<br />
              時には厳しく、<br className="inline md:hidden" />でも確実に前に進む。<br />
              それが、本物のカウンセリングです。
            </p>
            <div className="pt-8">
              <div className="text-6xl md:text-8xl animate-bounce">⚠️</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-black to-black"></div>
        
        <div className="container mx-auto px-4 space-y-10">
          <h2 className="text-4xl font-black md:text-6xl">
            その悩み、<br />
            ミシェルに聞かせてください
          </h2>
          <div className="flex justify-center">
            <Button 
              asChild 
              size="lg" 
              className="h-20 rounded-full bg-white px-12 text-2xl font-black text-blue-600 hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)]"
            >
              <Link href="/chat">
                今すぐ相談する
              </Link>
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            ※ 24時間365日、いつでもあなたのそばに
          </p>
        </div>
      </section>

    </div>
    </>
  );
}
