import dataSource from '../data-source';

async function seed(): Promise<void> {
  try {
    await dataSource.initialize();
    console.info('Base backend: no business seed data registered yet.');
  } finally {
    if (dataSource.isInitialized) await dataSource.destroy();
  }
}
void seed().catch(() => {
  console.error('Seed failed: check environment and database availability.');
  process.exitCode = 1;
});
