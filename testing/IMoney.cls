/**
 * @description Represents money - both the value and the currency.
 *              Money instances are immutable, so operating arithmetic on Money will return a new Money instance
 *              and never modify the instance being operated on.
 */
@NamespaceAccessible
public interface IMoney extends SomeClass {
  Money sum(List<Money> moneyList);

  Money convertTo(String isoCode);
}
