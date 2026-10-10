import { BRAND } from './brand';
import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <main className={styles.page}>
      <h1>{BRAND}</h1>
    </main>
  );
}
