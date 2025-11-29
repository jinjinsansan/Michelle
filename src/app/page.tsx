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
    <div className="relative z-50 bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Connecting Section: The Hook */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden px-4 text-center py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/50 via-white to-white"></div>
        
        <div className="space-y-8 max-w-4xl mx-auto">
          <p className="text-sm font-bold tracking-[0.5em] text-blue-500 uppercase animate-pulse">WHY MICHELLE?</p>
          <h2 className="font-heading text-4xl font-black leading-tight tracking-tight md:text-6xl lg:text-7xl text-slate-900">
            ただの「共感」は、<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              もう要らない。
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 md:text-xl leading-relaxed [text-wrap:balance] font-medium">
            一般的なAIは、耳障りの良い言葉を並べるだけ。<br />
            ミシェルは違います。<br />
            膨大な心理学ナレッジと独自のカウンセリング手法で、<br />
            あなたの悩みの「根本原因」へ、確実に辿り着きます。
          </p>
        </div>
      </section>

      {/* Step 1: Knowledge (RAG) */}
      <section className="relative py-20 md:py-32 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:gap-16 md:grid-cols-2 md:items-center">
            <div className="relative aspect-square w-full max-w-[300px] md:max-w-md mx-auto rounded-[2.5rem] bg-white border border-blue-100 p-10 flex items-center justify-center shadow-2xl shadow-blue-200/50 transform hover:rotate-2 transition-transform duration-500">
              <div className="text-8xl md:text-9xl animate-pulse">📚</div>
              <div className="absolute -top-4 -right-4 bg-blue-600 text-white px-6 py-2 text-lg md:text-xl font-bold rounded-full transform rotate-6 shadow-lg">
                世界初の実装
              </div>
            </div>
            <div className="space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
              <div className="inline-block rounded-full bg-blue-100 px-5 py-2 text-sm font-bold text-blue-600 border border-blue-200">
                REASON 01
              </div>
              <h2 className="text-3xl font-black md:text-5xl text-slate-900 leading-tight">
                圧倒的な<br />
                <span className="text-blue-600">専門知識量。</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed [text-wrap:balance]">
                ミシェルには、特定の心理学領域における<br className="hidden md:inline" />
                膨大なナレッジ(RAG)が搭載されています。<br />
                <br />
                表面的なアドバイスではなく、<br className="hidden md:inline" />
                心の仕組みに基づいた<br className="hidden md:inline" />
                「論理的で納得感のある」対話が可能です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 2: Methodology (Goal-Oriented) */}
      <section className="relative py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:gap-16 md:grid-cols-2 md:items-center md:flex-row-reverse">
            <div className="md:order-2 relative aspect-square w-full max-w-[300px] md:max-w-md mx-auto rounded-[2.5rem] bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-10 flex flex-col items-center justify-center shadow-2xl shadow-blue-100/50 text-center transform hover:-rotate-2 transition-transform duration-500">
              <div className="text-7xl md:text-8xl mb-6">🏁</div>
              <div className="text-xl md:text-2xl font-bold text-slate-400">ただ話すだけじゃない</div>
              <div className="text-blue-600 font-black text-3xl md:text-4xl mt-2">「ゴール」がある</div>
            </div>
            <div className="space-y-6 md:order-1 text-center md:text-left flex flex-col items-center md:items-start">
              <div className="inline-block rounded-full bg-blue-100 px-5 py-2 text-sm font-bold text-blue-600 border border-blue-200">
                REASON 02
              </div>
              <h2 className="text-3xl font-black md:text-5xl text-slate-900 leading-tight">
                独自の<br />
                <span className="text-cyan-500">解決メソッド。</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed [text-wrap:balance]">
                延々と愚痴を聞くだけのAIとは違います。<br />
                <br />
                ミシェルは、独自のカウンセリング手法を用い、<br className="hidden md:inline" />
                対話を通じてあなたを「気づき」へと導きます。<br />
                そこには明確なゴールが存在します。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3: Mirror (Reflection) */}
      <section className="relative py-20 md:py-32 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:gap-16 md:grid-cols-2 md:items-center">
            <div className="relative w-full max-w-[300px] md:max-w-md mx-auto">
              {/* Card Stack Effect */}
              <div className="absolute top-0 left-0 w-full h-full bg-blue-200 rounded-[2rem] transform rotate-6 opacity-40"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-blue-300 rounded-[2rem] transform -rotate-3 opacity-40"></div>
              <div className="relative rounded-[2rem] bg-white p-8 text-slate-900 shadow-2xl shadow-blue-200/50 transform transition-transform hover:scale-105 border border-blue-100">
                <div className="flex items-center justify-center mb-6">
                  <div className="text-6xl">🪞</div>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-center text-blue-900">AIは「鏡」になる</h3>
                <p className="text-base text-slate-600 mt-6 leading-loose text-center">
                  あなたの言葉の裏にある<br />
                  「本当の感情」や「思い込み」を映し出す。<br />
                  <span className="font-bold text-blue-600">答えは全て、あなたの内側にあります。</span>
                </p>
              </div>
            </div>
            <div className="space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
              <div className="inline-block rounded-full bg-blue-100 px-5 py-2 text-sm font-bold text-blue-600 border border-blue-200">
                REASON 03
              </div>
              <h2 className="text-3xl font-black md:text-5xl text-slate-900 leading-tight">
                世界でたった一つの<br />
                <span className="text-blue-600">自己理解体験。</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed [text-wrap:balance]">
                他人の意見に左右されるのは終わりです。<br />
                <br />
                ミシェルとの対話は、自分自身との対話。<br />
                あなただけの答えを見つける旅が、<br className="hidden md:inline" />
                ここから始まります。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 text-center overflow-hidden bg-blue-600 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-blue-600 to-blue-700"></div>
        
        <div className="container mx-auto px-4 space-y-12 relative z-10">
          <h2 className="text-4xl font-black md:text-6xl leading-tight">
            その悩み、<br />
            根本から終わらせませんか？
          </h2>
          <div className="flex justify-center">
            <Button 
              asChild 
              size="lg" 
              className="h-24 rounded-full bg-white px-16 text-2xl font-black text-blue-600 hover:bg-blue-50 hover:scale-105 transition-all shadow-2xl shadow-black/20"
            >
              <Link href="/chat">
                今すぐ相談する
              </Link>
            </Button>
          </div>
          <p className="text-blue-100 font-medium text-lg">
            ※ 24時間365日、いつでもあなたのそばに
          </p>
        </div>
      </section>

    </div>
    </>
  );
}
