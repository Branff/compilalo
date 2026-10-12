<script lang="ts">
  import { BLOG_POSTS, type BlogPost } from '$lib/data/blog';
  import {
    Search,
    BookOpen,
    Clock,
    User,
    ArrowRight,
    Tag,
    Scale,
    FileText,
    Sparkles,
    ShieldCheck
  } from 'lucide-svelte';

  let searchQuery = $state('');
  let selectedCategory = $state<string>('Tutti');

  const categories = [
    'Tutti',
    'Autocertificazioni',
    'Multe & Ricorsi',
    'Casa & Locazioni',
    'Deleghe',
    'Disdette',
    'Diffide'
  ];

  let filteredPosts = $derived.by(() => {
    let list = BLOG_POSTS;
    if (selectedCategory !== 'Tutti') {
      list = list.filter(p => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.seoKeywords.some(k => k.toLowerCase().includes(q)) ||
        p.normativa.toLowerCase().includes(q)
      );
    }
    return list;
  });

  const featuredPost = BLOG_POSTS[0];
</script>

<svelte:head>
  <title>Blog Civico & Guide Burocratiche &mdash; Risolvi Pratiche PA Senza Errori | COMPILALO</title>
  <meta name="description" content="Articoli pratici, guide legali e approfondimenti normativi su autocertificazioni DPR 445/2000, ricorsi multe, contratti di affitto e disdette. 100% gratuito e aggiornato." />
  <link rel="canonical" href="https://compilalo.it/blog" />
  <meta property="og:title" content="Blog Civico & Guide Burocratiche | COMPILALO" />
  <meta property="og:description" content="Approfondimenti normativi, guide pratiche ed esenzioni legali della Pubblica Amministrazione con fac-simile gratuiti pronti da firmare." />
  <meta property="og:url" content="https://compilalo.it/blog" />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Blog",
          "name": "Blog Civico di COMPILALO",
          "description": "Guide legali, burocratiche e amministrative per cittadini italiani con fac-simile gratuiti.",
          "url": "https://compilalo.it/blog",
          "publisher": {
            "@type": "Organization",
            "name": "COMPILALO",
            "url": "https://compilalo.it"
          }
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
            }
          ]
        }
      ]
    }
  </script>
</svelte:head>

<div class="max-w-5xl mx-auto space-y-12 py-2">

  <!-- Header Blog Istituzionale & Editoriale -->
  <header class="space-y-4">
    <div class="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-mono font-medium text-[#2563EB]">
      <BookOpen class="w-3.5 h-3.5" />
      <span>Guide Burocratiche Ufficiali &bull; Analisi Normativa & Modelli Pronti</span>
    </div>

    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#09090B] leading-tight">
          Il Blog Civico di COMPILALO
        </h1>
        <p class="text-xs sm:text-sm text-zinc-600 mt-2 max-w-2xl leading-relaxed">
          Guide pratiche, sentenze e approfondimenti normativi per districarsi nella burocrazia italiana a costo zero e senza mai inviare i propri dati personali a terzi.
        </p>
      </div>

      <a
        href="/compila"
        class="px-4 py-2.5 bg-[#09090B] hover:bg-[#2563EB] text-white rounded-xl text-xs font-bold flex items-center space-x-2 craft-transition craft-press shrink-0 self-start md:self-auto shadow-sm"
      >
        <FileText class="w-4 h-4" />
        <span>Tutti i 32 Modelli Pronti</span>
      </a>
    </div>

    <!-- Barra di Ricerca e Categorie Filtro -->
    <div class="pt-2 space-y-3">
      <div class="relative">
        <Search class="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Cerca un articolo o una legge (es. 'Cassazione 10505', 'DPR 445', 'affitto', 'disdetta')..."
          class="w-full text-xs pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl craft-input shadow-xs"
        />
      </div>

      <div class="flex flex-wrap gap-1.5 text-xs">
        {#each categories as cat}
          <button
            onclick={() => selectedCategory = cat}
            class="px-3.5 py-1.5 rounded-lg text-xs font-medium craft-transition craft-press {selectedCategory === cat ? 'bg-[#09090B] text-white shadow-xs' : 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'}"
          >
            {cat}
          </button>
        {/each}
      </div>
    </div>
  </header>

  <!-- Articolo in Evidenza (Featured Post) -->
  {#if selectedCategory === 'Tutti' && !searchQuery.trim()}
    <section class="craft-card rounded-2xl p-6 sm:p-8 hover:border-zinc-900 craft-hover space-y-4">
      <div class="flex items-center space-x-2 text-xs font-mono">
        <span class="px-2.5 py-0.5 rounded bg-blue-50 text-[#2563EB] font-bold uppercase tracking-wider text-[10px] border border-blue-100">
          IN EVIDENZA
        </span>
        <span class="text-zinc-400">&bull;</span>
        <span class="text-zinc-600">{featuredPost.category}</span>
        <span class="text-zinc-400">&bull;</span>
        <span class="text-zinc-500 flex items-center space-x-1">
          <Clock class="w-3 h-3" />
          <span>{featuredPost.readingTime} di lettura</span>
        </span>
      </div>

      <h2 class="font-serif text-2xl sm:text-3xl font-bold text-[#09090B] leading-tight">
        <a href="/blog/{featuredPost.slug}" class="hover:text-[#2563EB] craft-transition">
          {featuredPost.title}
        </a>
      </h2>

      <p class="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-3xl">
        {featuredPost.excerpt}
      </p>

      <div class="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center space-x-2.5 text-xs text-zinc-600">
          <div class="w-7 h-7 rounded-full bg-[#09090B] text-white flex items-center justify-center font-bold text-xs">
            {featuredPost.author.name[0]}
          </div>
          <div>
            <p class="font-bold text-zinc-900">{featuredPost.author.name}</p>
            <p class="text-[10px] text-zinc-400 font-mono">{featuredPost.author.role}</p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <a
            href="/compila?id={featuredPost.relatedTemplateId}"
            class="px-4 py-2 bg-blue-50 text-[#2563EB] hover:bg-blue-100/70 border border-blue-200/60 rounded-xl text-xs font-bold craft-transition craft-press"
          >
            {featuredPost.ctaText}
          </a>
          <a
            href="/blog/{featuredPost.slug}"
            class="px-4 py-2 bg-[#09090B] hover:bg-[#2563EB] text-white rounded-xl text-xs font-bold flex items-center space-x-1 craft-transition craft-press shadow-sm"
          >
            <span>Leggi Guida</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  {/if}

  <!-- Griglia Articoli del Blog -->
  <section class="space-y-4">
    <div class="flex items-center justify-between text-xs text-zinc-500 font-mono border-b border-zinc-200 pb-2">
      <span>{filteredPosts.length} articoli con riferimenti normativi e modelli scaricabili</span>
      <span>Ordinati per rilevanza</span>
    </div>

    {#if filteredPosts.length === 0}
      <div class="p-12 text-center bg-white border border-zinc-200 rounded-2xl space-y-2">
        <p class="text-sm font-bold text-zinc-900">Nessun articolo trovato</p>
        <p class="text-xs text-zinc-500">Prova a cercare con termini differenti o reimposta i filtri.</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each filteredPosts as post}
          <article class="craft-card rounded-2xl p-6 hover:border-zinc-900 craft-hover flex flex-col justify-between space-y-4 group">
            
            <div class="space-y-2.5">
              <div class="flex items-center justify-between text-[11px] font-mono">
                <span class="text-[10px] uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded font-semibold border border-blue-100">
                  {post.category}
                </span>
                <span class="text-zinc-400 flex items-center space-x-1">
                  <Clock class="w-3 h-3" />
                  <span>{post.readingTime}</span>
                </span>
              </div>

              <h3 class="font-serif text-lg sm:text-xl font-bold text-[#09090B] group-hover:text-[#2563EB] leading-snug craft-transition">
                <a href="/blog/{post.slug}">
                  {post.title}
                </a>
              </h3>

              <p class="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>
            </div>

            <div class="pt-3.5 border-t border-zinc-100 space-y-3">
              <div class="flex items-center justify-between text-xs">
                <span class="text-[11px] text-zinc-600 font-medium">{post.author.name}</span>
                <span class="text-[10px] font-mono text-zinc-400">{post.date}</span>
              </div>

              <div class="flex items-center justify-between pt-1">
                <a
                  href="/compila?id={post.relatedTemplateId}"
                  class="text-[11px] font-bold text-emerald-700 hover:underline flex items-center space-x-1"
                >
                  <FileText class="w-3 h-3" />
                  <span>Fac-simile pronto</span>
                </a>

                <a
                  href="/blog/{post.slug}"
                  class="text-xs font-bold text-[#09090B] group-hover:text-[#2563EB] flex items-center space-x-1 craft-transition"
                >
                  <span>Leggi tutto</span>
                  <ArrowRight class="w-3 h-3 group-hover:translate-x-0.5 craft-transition" />
                </a>
              </div>
            </div>

          </article>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Banner Bottom Funnel -->
  <section class="craft-card rounded-2xl p-6 sm:p-8 space-y-3 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-zinc-200">
    <div>
      <h3 class="font-serif text-xl font-bold text-[#09090B]">Hai già un documento PDF da compilare?</h3>
      <p class="text-xs text-zinc-600 mt-1 max-w-xl">
        Trascinalo direttamente nella nostra schermata principale: compiliamo i campi e apponi la firma col dito senza inviare dati online.
      </p>
    </div>

    <a
      href="/"
      class="px-5 py-2.5 bg-[#09090B] hover:bg-[#2563EB] text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 craft-transition craft-press shrink-0 shadow-sm"
    >
      <Sparkles class="w-3.5 h-3.5 text-emerald-400" />
      <span>Carica il tuo PDF</span>
    </a>
  </section>

</div>
