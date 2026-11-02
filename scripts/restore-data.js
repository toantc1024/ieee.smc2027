const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:smc2027_pG_sEcUrE_kEy_83726190@127.0.0.1:5434/ieee_smc_2027?schema=public"
    }
  }
});

async function importAll() {
  const backupPath = '/root/backups/ieee_smc_2027_neon_data_backup.json';
  if (!fs.existsSync(backupPath)) {
    throw new Error('Backup file not found at: ' + backupPath);
  }

  const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

  console.log('1. Importing users (' + data.users.length + ')...');
  for (const u of data.users) {
    await prisma.user.upsert({
      where: { id: u.id },
      create: u,
      update: u
    });
  }

  console.log('2. Importing pages (' + data.pages.length + ')...');
  for (const p of data.pages) {
    await prisma.page.upsert({
      where: { id: p.id },
      create: p,
      update: p
    });
  }

  console.log('3. Importing posts (' + data.posts.length + ')...');
  for (const post of data.posts) {
    await prisma.post.upsert({
      where: { id: post.id },
      create: post,
      update: post
    });
  }

  console.log('4. Importing settings (' + data.settings.length + ')...');
  for (const s of data.settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      create: s,
      update: s
    });
  }

  console.log('5. Importing registrations (' + data.registrations.length + ')...');
  for (const r of data.registrations) {
    await prisma.registration.upsert({
      where: { id: r.id },
      create: r,
      update: r
    });
  }

  console.log('6. Importing media files (' + data.mediaFiles.length + ')...');
  for (const m of data.mediaFiles) {
    await prisma.mediaFile.upsert({
      where: { id: m.id },
      create: m,
      update: m
    });
  }

  console.log('7. Importing email templates (' + data.emailTemplates.length + ')...');
  for (const e of data.emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { id: e.id },
      create: e,
      update: e
    });
  }

  console.log('All data imported successfully! Verifying counts:');
  const counts = {
    users: await prisma.user.count(),
    pages: await prisma.page.count(),
    posts: await prisma.post.count(),
    settings: await prisma.setting.count(),
    mediaFiles: await prisma.mediaFile.count(),
    emailTemplates: await prisma.emailTemplate.count()
  };
  console.log(counts);
}

importAll()
  .catch((e) => {
    console.error('Import error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
