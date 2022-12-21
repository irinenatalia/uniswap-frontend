import * as React from 'react'
import styles from '../styles/Home.module.css'

const CurrencyField = props => {
  const getPrice = (value) => {
    props.getSwapPrice(value)
  }

  return (
    <div className={styles.currencyInput}>
      <div className={styles.numberContainer}>
        {props.loading ? (
          <div className={styles.spinnerContainer}>
            fetching...
          </div>
        ) : (
          <input
            className={styles.currencyInputField}
            placeholder="0.0"
            value={props.value}
            onBlur={e => (props.field === 'input' ? getPrice(e.target.value) : null)}
          />
        )}
      </div>
      <div className={styles.tokenContainer}>
        <span className={styles.tokenName}>{props.tokenName}</span>
        <div className={styles.balanceContainer}>
          <span className={styles.balanceAmount}>Balance: {props.balance?.toFixed(3)}</span>
        </div>
      </div>
    </div>
  )
}

export default CurrencyField