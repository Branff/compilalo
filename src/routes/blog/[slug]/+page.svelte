<script lang="ts">
  import { BLOG_POSTS, type BlogPost } from '$lib/data/blog';
  import {
    ArrowLeft,
    Clock,
    Scale,
    FileText,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
    Share2,
    BookOpen
  } from 'lucide-svelte';

  let { data }: { data: { post: BlogPost } } = $props();
  let post = $derived(data.post);

  let relatedPosts = $derived(
    BLOG_POSTS.filter(p => p.id !== post.id && (p.category === post.category || true)).slice(0, 2)
  );

  let copiedToast = $state(false);

  function copyArticleLink() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      copiedToast = true;
      setTimeout(() => copiedToast = false, 2500);
    }
  }
</script>

<svelte:head>
  <title>{post.title} | Blog COMPILALO</title>
  <meta name="description" content={post.excerpt} />
  <link rel="canonical" href="https://compilalo.it/blog/{post.slug}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="{post.title} | COMPILALO" />
  <meta property="og:description" content={post.excerpt} />
  <meta property="og:url" content="https://compilalo.it/blog/{post.slug}" />
  <meta property="article:published_time" content={post.publishedAt} />
  <meta property="article:section" content={post.category} />
  <meta property="article:author" content={post.author.name} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={post.title} />
  <meta name="twitter:description" content={post.excerpt} />
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

<div class="max-w-3xl mx-auto space-y-10 py-6">

  <!-- Navigazione di Ritorno & Breadcrumb -->
  <div class="flex items-center justify-between">
    <a
      href="/blog"
      class="text-xs font-semibold text-[#52525B] hover:text-[#18181B] flex items-center space-x-1.5 craft-transition"
    >
      <ArrowLeft class="w-4 h-4" />
      <span>Torna a tutti gli articoli del Blog</span>
    </a>

    <button
      onclick={copyArticleLink}
      class="text-xs text-[#71717A] hover:text-[#18181B] flex items-center space-x-1 craft-transition"
      title="Copia link articolo"
    >
      <Share2 class="w-3.5 h-3.5" />
      <span>{copiedToast ? 'Link copiato!' : 'Condividi'}</span>
    </button>
  </div>

  <!-- Header Articolo -->
  <header class="space-y-4 border-b border-[#E4E4E7] pb-8">
    <div class="flex flex-wrap items-center gap-2 text-xs font-mono">
      <span class="px-2.5 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] font-bold uppercase tracking-wider text-[10px]">
        {post.category}
      </span>
      <span class="text-[#71717A]">&middot;</span>
      <span class="text-[#71717A] flex items-center space-x-1">
        <Clock class="w-3.5 h-3.5" />
        <span>{post.readingTime} di lettura</span>
      </span>
      <span class="text-[#71717A]">&middot;</span>
      <span class="text-[#71717A]">{post.date}</span>
    </div>

    <h1 class="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#18181B] leading-tight">
      {post.title}
    </h1>

    <p class="text-sm sm:text-base text-[#52525B] leading-relaxed italic">
      {post.excerpt}
    </p>

    <!-- Autore e Riferimento Normativo -->
    <div class="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#F2F1ED]">
      <div class="flex items-center space-x-3 text-xs">
        <div class="w-9 h-9 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-sm">
          {post.author.name[0]}
        </div>
        <div>
          <p class="font-bold text-[#18181B]">{post.author.name}</p>
          <p class="text-[11px] text-[#71717A]">{post.author.role}</p>
        </div>
      </div>

      <div class="flex items-center space-x-1.5 text-xs font-mono text-[#1D4ED8] bg-[#EFF6FF] px-3 py-1.5 rounded-lg border border-[#BFDBFE]">
        <Scale class="w-3.5 h-3.5 shrink-0" />
        <span class="truncate max-w-xs">{post.normativa}</span>
      </div>
    </div>
  </header>

  <!-- Banner Callout per Compilazione Rapida in 1-Click (Funnel Primario) -->
  <div class="p-4 sm:p-5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div class="space-y-1">
      <div class="flex items-center space-x-2 text-xs font-bold text-[#065F46] uppercase tracking-wider">
        <CheckCircle2 class="w-4 h-4 text-[#059669]" />
        <span>Modello Conforme Disponibile</span>
      </div>
      <p class="text-xs text-[#065F46]">
        Puoi compilare questo documento adesso, inserire la firma ed esportare il PDF gratis senza registrare alcun account.
      </p>
    </div>

    <a
      href="/compila?id={post.relatedTemplateId}"
      class="px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold rounded flex items-center justify-center space-x-1.5 craft-transition craft-press shrink-0 shadow-xs"
    >
      <FileText class="w-3.5 h-3.5" />
      <span>{post.ctaText}</span>
      <ArrowRight class="w-3.5 h-3.5" />
    </a>
  </div>

  <!-- Corpo dell'Articolo con Sezioni Strutturate -->
  <article class="prose prose-neutral max-w-none space-y-8 text-sm sm:text-base text-[#27272A] leading-relaxed">
    {#each post.content as section}
      <section class="space-y-3">
        <h2 class="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          {section.heading}
        </h2>
        <p class="text-[#3F3F46] leading-relaxed">
          {section.text}
        </p>
      </section>
    {/each}
  </article>

  <!-- Box Garanzia Privacy Zero-Knowledge -->
  <div class="p-5 bg-[#F9F9F8] border border-[#E4E4E7] rounded-xl space-y-2 text-xs text-[#52525B]">
    <div class="flex items-center space-x-2 text-[#18181B] font-bold">
      <ShieldCheck class="w-4 h-4 text-[#059669]" />
      <span>Come COMPILALO garantisce la tua riservatezza</span>
    </div>
    <p>
      Quando compili il fac-simile su COMPILALO, i tuoi dati e la tua firma non vengono trasmessi a nessun server web. Tutta l'elaborazione del PDF avviene direttamente nella memoria del tuo browser tramite tecnologia crittografica client-side.
    </p>
  </div>

  <!-- Card CTA Finale ad Alto Impatto -->
  <section class="bg-white border-2 border-[#18181B] rounded-xl p-6 sm:p-8 space-y-4 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-6">
    <div class="space-y-1">
      <h3 class="font-serif text-xl font-bold text-[#18181B]">
        Procedi alla compilazione del modulo
      </h3>
      <p class="text-xs text-[#52525B]">
        Tempo stimato: meno di 1 minuto. Include calcolo automatico del Codice Fiscale e apposizione firma col dito.
      </p>
    </div>

    <a
      href="/compila?id={post.relatedTemplateId}"
      class="px-6 py-3 bg-[#18181B] hover:bg-[#1D4ED8] text-white text-xs font-bold tracking-wider uppercase rounded flex items-center justify-center space-x-2 craft-transition craft-press shrink-0 shadow-sm"
    >
      <span>{post.ctaText}</span>
      <ArrowRight class="w-4 h-4" />
    </a>
  </section>

  <!-- Articoli Correlati -->
  <section class="space-y-4 pt-6 border-t border-[#E4E4E7]">
    <h3 class="font-serif text-lg font-bold text-[#18181B]">Guide correlate consigliate:</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {#each relatedPosts as rel}
        <a
          href="/blog/{rel.slug}"
          class="p-4 bg-white border border-[#E4E4E7] rounded-lg hover:border-[#18181B] craft-transition space-y-2 group"
        >
          <span class="text-[10px] font-mono uppercase tracking-wider text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded">
            {rel.category}
          </span>
          <h4 class="font-serif text-sm font-bold text-[#18181B] group-hover:text-[#1D4ED8] leading-snug craft-transition">
            {rel.title}
          </h4>
          <span class="text-xs text-[#71717A] flex items-center space-x-1 pt-1">
            <span>Leggi guida</span>
            <ArrowRight class="w-3 h-3" />
          </span>
        </a>
      {/each}
    </div>
  </section>

</div>
