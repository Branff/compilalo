<script lang="ts">
  import { page } from '$app/stores';
  import { BLOG_POSTS, type BlogPost } from '$lib/data/blog';
  import {
    ArrowLeft,
    Clock,
    User,
    Calendar,
    Scale,
    FileText,
    ArrowRight,
    Share2,
    CheckCircle2,
    ShieldCheck,
    Bookmark
  } from 'lucide-svelte';

  let postSlug = $derived($page.params.slug);
  let post = $derived(BLOG_POSTS.find(p => p.slug === postSlug) || BLOG_POSTS[0]);

  let copiedToast = $state(false);

  function copyArticleLink() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      copiedToast = true;
      setTimeout(() => copiedToast = false, 2400);
    }
  }

  let relatedPosts = $derived(
    BLOG_POSTS.filter(p => p.slug !== post.slug && p.category === post.category).slice(0, 2)
  );
</script>

<svelte:head>
  <title>{post.title} &mdash; Guida Giuridica Ufficiale | COMPILALO</title>
  <meta name="description" content="{post.excerpt}" />
  <meta name="keywords" content="{post.seoKeywords.join(', ')}" />
  <link rel="canonical" href="https://compilalo.it/blog/{post.slug}" />
  <meta property="og:title" content="{post.title} | COMPILALO" />
  <meta property="og:description" content="{post.excerpt}" />
  <meta property="og:url" content="https://compilalo.it/blog/{post.slug}" />
  <meta property="og:type" content="article" />
  <meta name="article:published_time" content="{post.publishedAt}" />
  <meta name="article:section" content="{post.category}" />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          "@id": "https://compilalo.it/blog/" + {JSON.stringify(post.slug)} + "#article",
          "headline": {JSON.stringify(post.title)},
          "description": {JSON.stringify(post.excerpt)},
          "datePublished": {JSON.stringify(post.publishedAt)},
          "dateModified": {JSON.stringify(post.publishedAt)},
          "mainEntityOfPage": "https://compilalo.it/blog/" + {JSON.stringify(post.slug)},
          "inLanguage": "it-IT",
          "articleSection": {JSON.stringify(post.category)},
          "author": {
            "@type": "Person",
            "name": {JSON.stringify(post.author.name)},
            "jobTitle": {JSON.stringify(post.author.role)}
          },
          "publisher": {
            "@type": "Organization",
            "name": "COMPILALO",
            "url": "https://compilalo.it",
            "logo": "https://compilalo.it/favicon.svg"
          },
          "keywords": {JSON.stringify(post.seoKeywords.join(', '))}
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://compilalo.it"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Blog Civico",
              "item": "https://compilalo.it/blog"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": {JSON.stringify(post.title)},
              "item": "https://compilalo.it/blog/" + {JSON.stringify(post.slug)}
            }
          ]
        }
      ]
    }
  </script>
</svelte:head>

<div class="max-w-3xl mx-auto space-y-10 py-4">

  <!-- Navigazione di Ritorno & Breadcrumb -->
  <div class="flex items-center justify-between">
    <a
      href="/blog"
      class="text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center space-x-1.5 craft-transition craft-press"
    >
      <ArrowLeft class="w-4 h-4" />
      <span>Torna a tutte le guide</span>
    </a>

    <button
      onclick={copyArticleLink}
      class="text-xs text-zinc-500 hover:text-zinc-950 flex items-center space-x-1.5 craft-transition craft-press"
      title="Copia link articolo"
    >
      <Share2 class="w-3.5 h-3.5" />
      <span>{copiedToast ? 'Link copiato!' : 'Condividi'}</span>
    </button>
  </div>

  <!-- Header Articolo con Tipografia Istituzionale -->
  <header class="space-y-4 border-b border-zinc-200/80 pb-8">
    <div class="flex flex-wrap items-center gap-2 text-xs font-mono">
      <span class="px-2.5 py-0.5 rounded bg-blue-50 text-[#2563EB] font-bold uppercase tracking-wider text-[10px] border border-blue-100">
        {post.category}
      </span>
      <span class="text-zinc-300">&bull;</span>
      <span class="text-zinc-500 flex items-center space-x-1">
        <Clock class="w-3 h-3" />
        <span>{post.readingTime} di lettura</span>
      </span>
      <span class="text-zinc-300">&bull;</span>
      <span class="text-zinc-500">{post.date}</span>
    </div>

    <h1 class="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#09090B] leading-[1.12]">
      {post.title}
    </h1>

    <p class="text-base sm:text-lg text-zinc-600 leading-relaxed font-normal">
      {post.excerpt}
    </p>

    <!-- Autore e Riferimento Normativo -->
    <div class="pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-zinc-100">
      <div class="flex items-center space-x-3 text-xs">
        <div class="w-9 h-9 rounded-full bg-[#09090B] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
          {post.author.name[0]}
        </div>
        <div>
          <p class="font-bold text-zinc-900">{post.author.name}</p>
          <p class="text-[11px] text-zinc-400 font-mono">{post.author.role}</p>
        </div>
      </div>

      <div class="flex items-center space-x-2 text-xs font-mono text-[#2563EB] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/60">
        <Scale class="w-3.5 h-3.5 shrink-0" />
        <span class="truncate max-w-xs">{post.normativa}</span>
      </div>
    </div>
  </header>

  <!-- Banner Callout per Compilazione Rapida in 1-Click (Funnel Primario) -->
  <div class="p-5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div class="space-y-1">
      <div class="flex items-center space-x-2 text-xs font-bold text-emerald-900 uppercase font-mono tracking-wider">
        <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Modello Conforme Disponibile</span>
      </div>
      <p class="text-xs text-emerald-800 leading-relaxed">
        Puoi compilare questo documento ora, inserire la firma ed esportare il PDF ufficiale senza registrare alcun account.
      </p>
    </div>

    <a
      href="/compila?id={post.relatedTemplateId}"
      class="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 craft-transition craft-press shrink-0 shadow-sm"
    >
      <FileText class="w-3.5 h-3.5" />
      <span>{post.ctaText}</span>
      <ArrowRight class="w-3.5 h-3.5" />
    </a>
  </div>

  <!-- Corpo dell'Articolo con Sezioni Strutturate -->
  <article class="space-y-8 text-base text-zinc-800 leading-relaxed">
    {#each post.content as section}
      <section class="space-y-3">
        <h2 class="font-serif text-2xl font-bold text-[#09090B]">
          {section.heading}
        </h2>
        <p class="text-zinc-600 leading-relaxed">
          {section.text}
        </p>
      </section>
    {/each}
  </article>

  <!-- Box Garanzia Privacy Zero-Knowledge -->
  <div class="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2 text-xs text-zinc-600">
    <div class="flex items-center space-x-2 text-zinc-900 font-bold">
      <ShieldCheck class="w-4 h-4 text-emerald-600 shrink-0" />
      <span>Come COMPILALO garantisce la tua riservatezza</span>
    </div>
    <p class="leading-relaxed">
      Quando compili il fac-simile su COMPILALO, i tuoi dati anagrafici e la tua firma non vengono mai trasmessi a nessun server web. Tutta l'elaborazione del PDF avviene direttamente nella memoria del tuo browser tramite tecnologia crittografica client-side.
    </p>
  </div>

  <!-- Card CTA Finale ad Alto Impatto -->
  <section class="craft-card rounded-2xl p-6 sm:p-8 space-y-4 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-zinc-900 shadow-md">
    <div class="space-y-1">
      <h3 class="font-serif text-2xl font-bold text-[#09090B]">
        Procedi alla compilazione del modulo
      </h3>
      <p class="text-xs text-zinc-600 leading-relaxed">
        Tempo stimato: meno di 1 minuto. Include calcolo automatico del Codice Fiscale e firma immediata col dito.
      </p>
    </div>

    <a
      href="/compila?id={post.relatedTemplateId}"
      class="px-6 py-3.5 bg-[#09090B] hover:bg-[#2563EB] text-white text-xs font-bold tracking-wider uppercase rounded-xl flex items-center justify-center space-x-2 craft-transition craft-press shrink-0 shadow-sm"
    >
      <span>{post.ctaText}</span>
      <ArrowRight class="w-4 h-4" />
    </a>
  </section>

  <!-- Articoli Correlati -->
  {#if relatedPosts.length > 0}
    <section class="space-y-4 pt-6 border-t border-zinc-200">
      <h3 class="font-serif text-xl font-bold text-[#09090B]">Guide correlate consigliate:</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#each relatedPosts as rel}
          <a
            href="/blog/{rel.slug}"
            class="craft-card rounded-xl p-5 hover:border-zinc-900 craft-hover space-y-2.5 group"
          >
            <span class="text-[10px] font-mono uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {rel.category}
            </span>
            <h4 class="font-serif text-base font-bold text-[#09090B] group-hover:text-[#2563EB] leading-snug craft-transition">
              {rel.title}
            </h4>
            <span class="text-xs font-medium text-zinc-500 group-hover:text-zinc-900 flex items-center space-x-1 pt-1 craft-transition">
              <span>Leggi guida</span>
              <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-0.5 craft-transition" />
            </span>
          </a>
        {/each}
      </div>
    </section>
  {/if}

</div>
