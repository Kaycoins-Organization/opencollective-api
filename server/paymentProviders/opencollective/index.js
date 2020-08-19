import collective from './collective';
import host from './host';
import manual from './manual';
import prepaid from './prepaid';
import virtualcard from './virtualcard';

/** Process orders from Open Collective payment method types */
async function processOrder(order) {
  switch (order.paymentMethod.type) {
    case 'prepaid':
      return prepaid.processOrder(order);
    case 'virtualcard':
      return virtualcard.processOrder(order);
    case 'manual':
      return manual.processOrder(order);
    case 'host':
      return collective.processOrder(order);
    case 'collective': // Fall through
    default:
      return collective.processOrder(order);
  }
}

/* API expected from a Payment Method provider */
export default {
  // payment method types
  // like cc, btc, prepaid, etc.
  types: {
    default: collective,
    collective,
    host,
    manual,
    prepaid,
    virtualcard,
  },
  processOrder,
};
