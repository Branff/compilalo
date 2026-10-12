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
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Blog Civico di COMPILALO",
      "description": "Guide legali, burocratiche e amministrative per cittadini italiani con fac-simile gratuiti.",
      "url": "https://compilalo.it/blog",
      "publisher": {
        "@type": "Organization",
        "name": "COMPILALO"
      }
    }
  </script>
</svelte:head>

<div class="max-w-5xl mx-auto space-y-12 py-4">

  <!-- Header Blog Istituzionale & Editoriale -->
  <header class="space-y-4">
    <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-medium text-[#1D4ED8]">
      <BookOpen class="w-3.5 h-3.5" />
      <span>Guide Burocratiche Ufficiali &middot; Analisi Normativa & Fac-simile Pronti</span>
    </div>

    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#18181B] leading-tight">
          Il Blog Civico di COMPILALO
        </h1>
        <p class="text-xs sm:text-sm text-[#52525B] mt-1.5 max-w-2xl leading-relaxed">
          Articoli chiari, approfondimenti giuridici e guide passo-passo per districarsi nella burocrazia italiana senza spendere un centesimo e senza cedere i propri dati personali.
        </p>
      </div>

      <a
        href="/compila"
        class="px-4 py-2 bg-[#18181B] hover:bg-[#1D4ED8] text-white rounded text-xs font-semibold flex items-center space-x-1.5 craft-transition craft-press shrink-0 self-start md:self-auto"
      >
        <FileText class="w-3.5 h-3.5" />
        <span>Tutti i 32 Modelli Pronti</span>
      </a>
    </div>

    <!-- Barra di Ricerca e Categorie Filtro -->
    <div class="pt-2 space-y-3">
      <div class="relative">
        <Search class="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Cerca un articolo o una legge (es. 'Cassazione 10505', 'DPR 445', 'affitto', 'disdetta')..."
          class="w-full text-xs pl-10 pr-4 py-3 bg-white border border-[#E4E4E7] rounded-lg craft-input shadow-sm"
        />
      </div>

      <div class="flex flex-wrap gap-1.5 text-xs">
        {#each categories as cat}
          <button
            onclick={() => selectedCategory = cat}
            class="px-3 py-1 rounded text-[11px] font-medium craft-transition craft-press {selectedCategory === cat ? 'bg-[#18181B] text-white' : 'bg-white border border-[#E4E4E7] text-[#52525B] hover:bg-[#F9F9F8]'}"
          >
            {cat}
          </button>
        {/each}
      </div>
    </div>
  </header>

  <!-- Articolo in Evidenza (Featured Post) -->
  {#if selectedCategory === 'Tutti' && !searchQuery.trim()}
    <section class="bg-white border border-[#E4E4E7] rounded-xl p-6 sm:p-8 hover:border-[#18181B] craft-transition shadow-sm space-y-4">
      <div class="flex items-center space-x-2 text-xs font-mono">
        <span class="px-2.5 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] font-bold uppercase tracking-wider text-[10px]">
          IN EVIDENZA
        </span>
        <span class="text-[#71717A]">&middot;</span>
        <span class="text-[#71717A]">{featuredPost.category}</span>
        <span class="text-[#71717A]">&middot;</span>
        <span class="text-[#71717A] flex items-center space-x-1">
          <Clock class="w-3 h-3" />
          <span>{featuredPost.readingTime} di lettura</span>
        </span>
      </div>

      <h2 class="font-serif text-2xl sm:text-3xl font-bold text-[#18181B] leading-tight">
        <a href="/blog/{featuredPost.slug}" class="hover:text-[#1D4ED8] craft-transition">
          {featuredPost.title}
        </a>
      </h2>

      <p class="text-xs sm:text-sm text-[#52525B] leading-relaxed max-w-3xl">
        {featuredPost.excerpt}
      </p>

      <div class="pt-3 border-t border-[#F2F1ED] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center space-x-2 text-xs text-[#71717A]">
          <div class="w-7 h-7 rounded-full bg-[#18181B] text-white flex items-center justify-center font-bold text-[11px]">
            {featuredPost.author.name[0]}
          </div>
          <div>
            <p class="font-medium text-[#18181B]">{featuredPost.author.name}</p>
            <p class="text-[10px] text-[#71717A]">{featuredPost.author.role}</p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <a
            href="/compila?id={featuredPost.relatedTemplateId}"
            class="px-3.5 py-2 bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE] rounded text-xs font-semibold craft-transition craft-press"
          >
            {featuredPost.ctaText}
          </a>
          <a
            href="/blog/{featuredPost.slug}"
            class="px-4 py-2 bg-[#18181B] hover:bg-[#1D4ED8] text-white rounded text-xs font-semibold flex items-center space-x-1 craft-transition craft-press"
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
    <div class="flex items-center justify-between text-xs text-[#71717A] border-b border-[#E4E4E7] pb-2">
      <span>{filteredPosts.length} articoli con riferimenti normativi e modelli scaricabili</span>
      <span>Ordinati per data di pubblicazione</span>
    </div>

    {#if filteredPosts.length === 0}
      <div class="p-12 text-center bg-white border border-[#E4E4E7] rounded-xl space-y-2">
        <p class="text-sm font-bold text-[#18181B]">Nessun articolo trovato</p>
        <p class="text-xs text-[#71717A]">Prova a cercare con termini differenti o reimposta i filtri.</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each filteredPosts as post}
          <article class="bg-white border border-[#E4E4E7] rounded-xl p-5 hover:border-[#18181B] craft-transition shadow-sm flex flex-col justify-between space-y-4 group">
            
            <div class="space-y-2.5">
              <div class="flex items-center justify-between text-[11px] font-mono">
                <span class="text-[10px] uppercase tracking-wider text-[#1D4ED8] bg-[#EFF6FF] px-2 py-0.5 rounded font-semibold">
                  {post.category}
                </span>
                <span class="text-[#71717A] flex items-center space-x-1">
                  <Clock class="w-3 h-3" />
                  <span>{post.readingTime}</span>
                </span>
              </div>

              <h3 class="font-serif text-lg font-bold text-[#18181B] group-hover:text-[#1D4ED8] leading-snug craft-transition">
                <a href="/blog/{post.slug}">
                  {post.title}
                </a>
              </h3>

              <p class="text-xs text-[#52525B] line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>
            </div>

            <div class="pt-3 border-t border-[#F2F1ED] space-y-3">
              <div class="flex items-center justify-between text-xs">
                <span class="text-[11px] text-[#71717A]">{post.author.name}</span>
                <span class="text-[10px] font-mono text-[#71717A]">{post.date}</span>
              </div>

              <div class="flex items-center justify-between pt-1">
                <a
                  href="/compila?id={post.relatedTemplateId}"
                  class="text-[11px] font-semibold text-[#059669] hover:underline flex items-center space-x-1"
                >
                  <FileText class="w-3 h-3" />
                  <span>Fac-simile pronto</span>
                </a>

                <a
                  href="/blog/{post.slug}"
                  class="text-xs font-bold text-[#18181B] group-hover:text-[#1D4ED8] flex items-center space-x-1 craft-transition"
                >
                  <span>Leggi tutto</span>
                  <ArrowRight class="w-3 h-3" />
                </a>
              </div>
            </div>

          </article>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Banner Bottom SEO Funnel -->
  <section class="bg-[#F9F9F8] border border-[#E4E4E7] rounded-xl p-6 sm:p-8 space-y-3 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h3 class="font-serif text-lg font-bold text-[#18181B]">Hai già un documento PDF da compilare?</h3>
      <p class="text-xs text-[#52525B] mt-0.5">
        Trascinalo direttamente nella nostra home: riconosciamo i campi e ci metti la firma col dito senza mandare dati online.
      </p>
    </div>

    <a
      href="/"
      class="px-5 py-2.5 bg-[#18181B] hover:bg-[#1D4ED8] text-white rounded text-xs font-semibold flex items-center justify-center space-x-1.5 craft-transition craft-press shrink-0"
    >
      <Sparkles class="w-3.5 h-3.5 text-[#10B981]" />
      <span>Carica il tuo PDF</span>
    </a>
  </section>

</div>
