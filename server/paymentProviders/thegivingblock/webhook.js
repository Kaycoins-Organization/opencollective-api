import OrderStatus from '../../constants/order_status';
import logger from '../../lib/logger';
import { sendThankYouEmail } from '../../lib/recurring-contributions';
import models from '../../models';

import { confirmOrder, decryptPayload } from './index';

export async function webhook(req) {
  logger.info('The Giving Block webhook');
  logger.info(`body: ${JSON.stringify(req.body)}`);

  const payloadString = decryptPayload(req.body.payload);
  logger.info(`payloadString: ${payloadString}`);

  const payload = JSON.parse(payloadString);
  logger.info(`payload: ${JSON.stringify(payload)}`);

  if (req.body.eventType === 'TRANSACTION_CONVERTED') {
    // See: https://app.gitbook.com/@the-giving-block/s/public-api-documentation/webhook-notifications
    const { pledgeId, valueAtDonationTimeUSD } = payload;

    const order = await models.Order.findOne({ where: { data: { pledgeId } } });
    if (!order) {
      throw new Error(`Could not find matching order. pledgeId=${pledgeId}`);
    }

    // update totalAmount with latest value
    await order.update({
      totalAmount: Number(valueAtDonationTimeUSD) * 100,
      currency: 'USD',
      status: OrderStatus.PAID,
      data: { ...order.data, payload },
    });

    // process as paid
    const transaction = await confirmOrder(order);

    // send email confirmation
    await sendThankYouEmail(order, transaction);
  }
}

export default webhook;
