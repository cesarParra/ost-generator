/**
 * @description Represents money - both the value and the currency.
 *              Money instances are immutable, so operating arithmetic on Money will return a new Money instance
 *              and never modify the instance being operated on.
 */
@NamespaceAccessible
public with sharing class Money extends SomeClass implements SomeInterface1, SomeInterface2 {
  @TestVisible private static String defaultCurrencyIsoCode;
  @TestVisible private static Boolean isMultiCurrencyOrganization;
  private String currencyIsoCode;
  private Decimal amount;

  public Object MyProp {get; set; }
  public Object myVariable;

  public Money(Decimal amount, String currencyIsoCode) {
    this.amount = amount;
    this.currencyIsoCode = currencyIsoCode;
  }

  public enum CustomParams
  {
    ENTITY_PAYMENT_GATEWAY_LINK_ID,
    ID,
    RESPONSEMODE,
    TARGET_DOMAIN,
    TYPE
  }

  /**
   * @description Constructs an instance of Money that represents a decimal amount.
   *              Sets the currency to the org's default currency.
   * @param amount The monetary amount.
   * @return Built Money instance.
   */
  @NamespaceAccessible
  public static Money of(Decimal amount) {
    setDefaultCurrencyCode();
    return new Money(amount, defaultCurrencyIsoCode);
  }

  /**
   * @description Constructs an instance of Money that represents a decimal amount.
   * @param amount The monetary amount.
   * @param currencyIsoCode The currency code for the Money instance to build.
   * @return Built Money instance.
   */
  @NamespaceAccessible
  public static Money of(Decimal amount, String currencyIsoCode) {
    return new Money(amount, currencyIsoCode);
  }

  /**
   * @description Constructs an instance of Money for an amount of zero.
   *              Sets the currency to the org's default currency.
   * @return Built Money instance.
   */
  @NamespaceAccessible
  public static Money zero() {
    return Money.of(0);
  }

  /**
   * @description Constructs an instance of Money for an amount of zero.
   * @param currencyIsoCode The currency code for the Money instance to build.
   * @return Built Money instance.
   */
  @NamespaceAccessible
  public static Money zero(String currencyIsoCode) {
    return Money.of(0, currencyIsoCode);
  }

  /**
   * @description Amount currency ISO code.
   * @return Currency ISO code for the amount.
   */
  @NamespaceAccessible
  public String getCurrency() {
    return this.currencyIsoCode != null ? this.currencyIsoCode : defaultCurrencyIsoCode;
  }

  /**
   * @description Amount value.
   * @return Value of the amount.
   */
  @NamespaceAccessible
  public Decimal getValue() {
    return this.amount;
  }

  /**
   * @description Adds the passed in Money to this instance.
   *              Please be aware that Money is immutable, so this instance will not be modified,
   *              instead a new instance will be returned.
   * @param moneyToAdd The money to add.
   * @return New instance of Money with the 2 values added.
   * @throws Money.MismatchedCurrencyException If the passed in money's currency does
   *         not match this instance's currency.
   */
  @NamespaceAccessible
  public Money add(Money moneyToAdd) {
    checkCurrenciesMatch(moneyToAdd);
    return Money.of(this.amount + moneyToAdd.getValue(), this.getCurrency());
  }

  /**
   * @description Subtracts the passed in Money to this instance.
   *              Please be aware that Money is immutable, so this instance will not be modified,
   *              instead a new instance will be returned.
   * @param moneyToSubtract The money to subtract.
   * @return New instance of Money with the 2 values subtracted.
   * @throws Money.MismatchedCurrencyException If the passed in money's currency does
   *         not match this instance's currency.
   */
  @NamespaceAccessible
  public Money subtract(Money moneyToSubtract) {
    checkCurrenciesMatch(moneyToSubtract);
    return Money.of(this.amount - moneyToSubtract.getValue(), this.getCurrency());
  }

  /**
   * @description Multiplies the passed in Money to this instance.
   *              Please be aware that Money is immutable, so this instance will not be modified,
   *              instead a new instance will be returned.
   * @param moneyToMultiply The money to multiply.
   * @return New instance of Money with the 2 values multiplied.
   * @throws Money.MismatchedCurrencyException If the passed in money's currency does
   *         not match this instance's currency.
   */
  @NamespaceAccessible
  public Money times(Money moneyToMultiply) {
    checkCurrenciesMatch(moneyToMultiply);
    return Money.of(this.amount * moneyToMultiply.getValue(), this.getCurrency());
  }

  /**
   * @description Adds up all the money passed in.
   * @param moneyList The money list to add.
   * @return New instance of Money with the values added.
   * @throws Money.MismatchedCurrencyException If the passed in money's currency does
   *         not match this instance's currency.
   */
  @NamespaceAccessible
  public static Money sum(List<Money> moneyList) {
    if (moneyList.isEmpty()) {
      return Money.zero();
    }

    Money sum = Money.zero(moneyList[0].getCurrency());
    for (Money currentMoney : moneyList) {
      sum = sum.add(currentMoney);
    }
    return sum;
  }

  /**
  * @description Compares 2 instances of money. Money instances are equal if the monetary value and the currencies
  *              match.
  * @param compareTo The instance to compare it to.
  * @return True if the instances are equal, false otherwise.
  */
  @NamespaceAccessible
  public Boolean equals(Object compareTo) {
    if (!(compareTo instanceof Money)) {
      return false;
    }

    Money compareToCast = (Money)compareTo;
    return this.getValue() == compareToCast.getValue() && this.getCurrency() == compareToCast.getCurrency();
  }

  /**
   * @description Converts this instance into a Money object that represents the passed in currency ISO code.
   * @param isoCode The currency to convert this Money to.
   * @return New Money instance with the converted monetary amount.
   */
  @NamespaceAccessible
  public Money convertTo(String isoCode) {
    if (moneyDoesNotNeedToBeConverted(isoCode)) {
      return Money.of(this.getValue(), this.getCurrency());
    }

    if (this.getValue() == 0) {
      return Money.zero(isoCode);
    }

    return Money.of(
      ExchangeRatesApi.v1.service().convert(
        this.getValue(),
        this.getCurrency(), isoCode),
      isoCode);
  }

  private Boolean moneyDoesNotNeedToBeConverted(String isoCode) {
    return !this.isMultiCurrencyOrganization() || isoCode == null || isoCode == this.getCurrency();
  }

  private void checkCurrenciesMatch(Money compareTo) {
    if (this.getCurrency() != compareTo.getCurrency()) {
      throw new MismatchedCurrencyException(buildErrorMessage(compareTo));
    }
  }

  private String buildErrorMessage(Money compareTo) {
    return String.format('{0} does not match the expected currency: {1}', new List<String>{
      compareTo.getCurrency(), this.getCurrency()
    });
  }

  private Boolean isMultiCurrencyOrganization() {
    if (isMultiCurrencyOrganization != null) {
      return isMultiCurrencyOrganization;
    }
    isMultiCurrencyOrganization = UserInfo.isMultiCurrencyOrganization();
    return isMultiCurrencyOrganization;
  }

  private static void setDefaultCurrencyCode() {
    if (defaultCurrencyIsoCode == null) {
      defaultCurrencyIsoCode = UserInfo.getDefaultCurrency();
    }
  }

  /**
   * @description Exception thrown when Money arithmetic is performed on currencies that do not match.
   */
  @NamespaceAccessible
  public class MismatchedCurrencyException extends Exception { }
}
