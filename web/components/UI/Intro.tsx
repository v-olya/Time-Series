import styles from './Intro.module.css';

export function Intro() {
  return (
    <div className={styles.legend}>
      <p >
        For this dataset, prices were collected separately across different distribution channels. 
        The column headers use symbols with specific meanings:
      </p>
      <ul>
        <li>
          <strong>Z</strong> = farm-gate (producer) price;
        </li>
        <li>
          <strong>P</strong> = processor (wholesale) price;
        </li>
        <li>
          <strong>S</strong> = retail price — the final price paid by consumers.
        </li>
      </ul>
      <p>
        Teasers on the home page show <strong>S</strong> (retail) series when available, 
        but an overall analysis is available on the corresponding pages.
      </p>
    </div>
  );
}
