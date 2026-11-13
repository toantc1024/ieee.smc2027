const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const Module = require('node:module');

const root = process.cwd();
const ts = require(path.join(root, 'node_modules/typescript'));

for (const ext of ['.ts', '.tsx']) {
  require.extensions[ext] = (mod, filename) => {
    const raw = fs.readFileSync(filename, 'utf8');
    const out = ts.transpileModule(raw, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
      fileName: filename,
    }).outputText;
    return mod._compile(out, filename);
  };
}

let mockPageData = null;
let mockUser = null;

function MockPublicPageRenderer(props) {
  return { type: 'PublicPageRenderer', props };
}

const originalLoad = Module._load;
Module._load = function (request, parent, ...rest) {
  if (request === '@/services') {
    return {
      cmsService: {
        getPageByIdOrSlug: async (id) => mockPageData,
      },
    };
  }
  if (request === '@/lib') {
    return {
      withTimeout: async (p) => p,
      revalidatePagePaths: (slug) => {},
      prisma: {},
    };
  }
  if (request === '@/lib/auth') {
    return {
      getCurrentUser: async () => mockUser,
    };
  }
  if (request === '@/lib/page-access') {
    return originalLoad.call(this, path.join(root, 'src/lib/page-access.ts'), parent, ...rest);
  }
  if (request === 'next/navigation') {
    return {
      notFound: () => {
        throw new Error('NOT_FOUND');
      },
    };
  }
  if (request === '@/app/(public)/[slug]/public-page-renderer') {
    return { PublicPageRenderer: MockPublicPageRenderer };
  }
  if (request === '@/components/sections/CommitteesSection') {
    return { CommitteesSection: (props) => ({ type: 'CommitteesSectionFallback', props }) };
  }
  if (request === '@/components/sections/NewsList') {
    return { NewsList: (props) => ({ type: 'NewsListFallback', props }) };
  }
  if (request === './submissions-fallback') {
    return { SubmissionsFallbackView: (props) => ({ type: 'SubmissionsFallbackView', props }) };
  }
  if (request === './travel-fallback') {
    return { TravelFallbackView: (props) => ({ type: 'TravelFallbackView', props }) };
  }
  if (request === '@/components/shared/draft-preview-banner') {
    return { DraftPreviewBanner: (props) => ({ type: 'DraftPreviewBanner', props }) };
  }
  return originalLoad.call(this, request, parent, ...rest);
};

const CommitteesPage = require(path.join(root, 'src/app/committees/page.tsx')).default;
const SubmissionsPage = require(path.join(root, 'src/app/submissions/page.tsx')).default;
const TravelPage = require(path.join(root, 'src/app/travel/page.tsx')).default;
const NewsPage = require(path.join(root, 'src/app/news/page.tsx')).default;

(async () => {
  console.log('Testing Public Page Dynamic Sync across standard routes...');

  // 1. Committees Page with database blocks
  mockPageData = {
    id: 'committees',
    slug: 'committees',
    title: 'Committees',
    version: 3,
    is_published: true,
    blocks: [
      { id: 'custom-1', type: 'CommitteesSection', props: { title: 'Updated Leadership' } },
      { id: 'custom-2', type: 'ContactCards', props: { email: 'test@ieee.org' } },
    ],
  };
  mockUser = null;

  const committeesRes = await CommitteesPage({ searchParams: Promise.resolve({}) });
  assert.equal(committeesRes.type, 'div');
  // Check children contains PublicPageRenderer with our 2 custom blocks
  const rendererChild = committeesRes.props.children.find(
    (c) => c && c.type === MockPublicPageRenderer
  );
  assert.ok(rendererChild, 'PublicPageRenderer should be rendered when blocks exist');
  assert.equal(rendererChild.props.blocks.length, 2);
  assert.equal(rendererChild.props.blocks[0].id, 'custom-1');
  console.log('✔ Committees page correctly renders database saved blocks');

  // 2. Submissions Page with database blocks
  mockPageData = {
    id: 'submissions',
    slug: 'submissions',
    title: 'Submissions',
    version: 2,
    is_published: true,
    blocks: [{ id: 'sub-block-1', type: 'CallForPapers', props: {} }],
  };

  const submissionsRes = await SubmissionsPage({ searchParams: Promise.resolve({}) });
  assert.equal(submissionsRes.type, 'div');
  const subRenderer = submissionsRes.props.children.find(
    (c) => c && c.type === MockPublicPageRenderer
  );
  assert.ok(subRenderer, 'Submissions page should render PublicPageRenderer');
  assert.equal(subRenderer.props.blocks[0].id, 'sub-block-1');
  console.log('✔ Submissions page correctly renders database saved blocks');

  // 3. Travel Page with database blocks
  mockPageData = {
    id: 'travel',
    slug: 'travel',
    title: 'Travel',
    version: 4,
    is_published: true,
    blocks: [{ id: 'trv-1', type: 'Venue', props: {} }],
  };

  const travelRes = await TravelPage({ searchParams: Promise.resolve({}) });
  assert.equal(travelRes.type, 'div');
  const trvRenderer = travelRes.props.children.find(
    (c) => c && c.type === MockPublicPageRenderer
  );
  assert.ok(trvRenderer, 'Travel page should render PublicPageRenderer');
  assert.equal(trvRenderer.props.blocks[0].id, 'trv-1');
  console.log('✔ Travel page correctly renders database saved blocks');

  // 4. News Page with database blocks
  mockPageData = {
    id: 'news',
    slug: 'news',
    title: 'News',
    version: 1,
    is_published: true,
    blocks: [{ id: 'news-b1', type: 'NewsList', props: {} }],
  };

  const newsRes = await NewsPage({ searchParams: Promise.resolve({}) });
  assert.equal(newsRes.type, 'div');
  const newsRenderer = newsRes.props.children.find(
    (c) => c && c.type === MockPublicPageRenderer
  );
  assert.ok(newsRenderer, 'News page should render PublicPageRenderer');
  assert.equal(newsRenderer.props.blocks[0].id, 'news-b1');
  console.log('✔ News page correctly renders database saved blocks');

  // 5. Fallback verification when database page is null
  mockPageData = null;
  const committeesFallback = await CommitteesPage({ searchParams: Promise.resolve({}) });
  assert.equal(committeesFallback.props.children.type.name, 'CommitteesSection');

  const submissionsFallback = await SubmissionsPage({ searchParams: Promise.resolve({}) });
  assert.equal(submissionsFallback.type.name, 'SubmissionsFallbackView');

  const travelFallback = await TravelPage({ searchParams: Promise.resolve({}) });
  assert.equal(travelFallback.type.name, 'TravelFallbackView');

  console.log('✔ Missing-page / empty-database graceful fallbacks verified');

  console.log('All public page dynamic sync tests passed successfully!');
})().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

