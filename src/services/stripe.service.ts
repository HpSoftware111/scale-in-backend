import { hash } from 'bcrypt';
import { Service } from 'typedi';
import { HttpException } from '@exceptions/httpException';
import Stripe from 'stripe';
import { ACTIVE_MONTHLY_PLAN_ID, ACTIVE_YEARLY_PLAN_ID } from '@/utils/constants';
import { formatCardStringNumber } from '@/utils/common';

interface CreatePaymentMethodParams {
  card_number: string;
  exp_month: number;
  exp_year: number;
  cvc: string;
  email?: string;
  name?: string;
}

interface PaymentMethod {
  id: string;
}

interface StripeCustomer {
  id: string;
  name: string;
  email: string;
}

// const stripe = require('stripe')('sk_test_51PachfJmJUzDg2bep9d0oJZ0xmGUWTluLCxNC8Zv9fAWQxDNHs4PpjYUyBjAw9Gizpe5MEkTGsCImQCWJznWw5O100C3N3DH8c', {
//   apiVersion: '2022-08-01',
//   appInfo: {
//     // For sample support and debugging, not required for production:
//     name: 'Scale In Backend',
//     version: '0.0.1',
//     url: 'https://github.com/lojorgepez/scale-in-backend',
//   },
// });
// @Start account
const stripe = require('stripe')('sk_test_51PgSnqD4onZtjAQ2nwjLYA4DJh5tFwi4wd2UYnA52HJwFrxt2V5mwqS6EAdqa0P7XZsrgkhpZYGYDP0Oi2f3UCqx007W2JwZz4', {
  apiVersion: '2022-08-01',
  appInfo: {
    // For sample support and debugging, not required for production:
    name: 'Scale In Backend',
    version: '0.0.1',
    url: 'https://github.com/smartwave601/scale-in-backend.git',
  },
});

@Service()
export class StripeService {
  public createPaymentMethod = async ({
    card_number,
    exp_month,
    exp_year,
    cvc,
    email = '',
    name = '',
  }: CreatePaymentMethodParams): Promise<Stripe.PaymentMethod> => {
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: card_number,
        exp_month: exp_month,
        exp_year: exp_year,
        cvc: cvc,
      },
      billing_details: {
        email: email,
        name: name,
      },
    });
    return paymentMethod;
  };

  public createStripeCustomer = async ({ email, name, paymentMethodId }) => {
    const customer = await stripe.customers.create({
      name,
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    return customer;
  };

  public checkOffer = (data: any) => {
    return data.price.id === ACTIVE_MONTHLY_PLAN_ID || data.price.id === ACTIVE_YEARLY_PLAN_ID;
  };

  public createSubscription = async ({ customer_id, price_id }) => {
    const subscription = await stripe.subscriptions.create({
      customer: customer_id,
      items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
    });
    return subscription;
  };

  public createPrice = async ({ unit_amount }) => {
    const price = await stripe.prices.create({
      unit_amount_decimal: unit_amount.toString(), // Amount in cents ($5.00)
      currency: 'usd', // Currency
      recurring: {
        // Recurring details
        interval: 'month', // Billing interval (monthly)
        // usage_type: 'metered', // Usage type (metered)
      },
      billing_scheme: 'per_unit', // Billing method (per unit)
      product_data: {
        name: 'Quant Invest Monthly Plan',
      },
    });
    return price;
  };

  public checkSubscriptionStatus = async customerId => {
    try {
      // Retrieve customer object
      const customer = await stripe.customers.retrieve(customerId, {
        expand: ['subscriptions.data'],
      });

      // Check if the customer has active subscriptions
      const activeMonthlySubscription = customer.subscriptions.data.find((item: any) => item.plan.id == ACTIVE_MONTHLY_PLAN_ID);
      const activeYearlySubscription = customer.subscriptions.data.find((item: any) => item.plan.id == ACTIVE_YEARLY_PLAN_ID);

      const passiveSubscription = customer.subscriptions.data.find(
        (item: any) => item.plan.id != ACTIVE_MONTHLY_PLAN_ID && item.plan.id != ACTIVE_YEARLY_PLAN_ID,
      );

      let isActiveStatus = false;
      let isPassiveStatus = false;

      let activeSubscriptionEndDate = null;
      let passiveSubscriptionEndDate = null;
      if (activeMonthlySubscription) {
        if (activeMonthlySubscription.status == 'active') isActiveStatus = true;
        activeSubscriptionEndDate = new Date(activeMonthlySubscription.current_period_end * 1000);
      }

      if (activeYearlySubscription) {
        if (activeYearlySubscription.status == 'active') isActiveStatus = true;
        activeSubscriptionEndDate = new Date(activeYearlySubscription.current_period_end * 1000);
      }

      if (passiveSubscription) {
        if (passiveSubscription.status == 'active') isPassiveStatus = true;
        passiveSubscriptionEndDate = new Date(passiveSubscription.current_period_end * 1000);
      }

      return {
        activeStatus: isActiveStatus,
        passiveStatus: isPassiveStatus,
        activeSubscriptionEndDate,
        passiveSubscriptionEndDate,
      };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return {
        activeStatus: false,
        passiveStatus: false,
        activeSubscriptionEndDate: new Date(),
        passiveSubscriptionEndDate: new Date(),
      };
    }
  };

  public getTotalPaidAmount = async subscriptionId => {
    try {
      // Retrieve invoices for the subscription
      const invoices = await stripe.invoices.list({
        subscription: subscriptionId,
        limit: 100, // Adjust the limit as needed to retrieve all invoices
      });

      // Calculate total paid amount
      let totalPaidAmount = 0;
      invoices.data.forEach(invoice => {
        totalPaidAmount += invoice.amount_paid;
      });

      console.log('Total Paid Amount:', (totalPaidAmount / 100).toFixed(2)); // Convert cents to dollars
      return (totalPaidAmount / 100).toFixed(2);
    } catch (error) {
      console.error('Error getting total paid amount:', error);
      return '0';
    }
  };
  public getInvoicesListFromCustomerId = async (customerId, startDate, endDate) => {
    try {
      // Retrieve invoices for the subscription
      const invoices = await stripe.invoices.list({
        customer: customerId,
        created: {
          gte: Math.floor(new Date(startDate).getTime() / 1000),
          lte: Math.floor(new Date(endDate).getTime() / 1000),
        },
        limit: 100, // Adjust the limit as needed to retrieve all invoices
      });

      return invoices;
    } catch (error) {
      console.error('Error getting total paid amount:', error);
      return [];
    }
  };

  public getPaymentMethodDetails = async paymentMethodId => {
    try {
      // Retrieve payment method object
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

      return {
        type: paymentMethod.type,
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        cardName: paymentMethod.billing_details.name,
        exp_month: formatCardStringNumber(paymentMethod.card.exp_month),
        exp_year: formatCardStringNumber(paymentMethod.card.exp_year),
      };
    } catch (error) {
      return {
        type: '',
        brand: '',
        last4: '',
        cardName: '',
        exp_month: '',
        exp_year: '',
      };
    }
  };

  public getSubscriptionDetailsFromId = async subscriptionId => {
    try {
      // Retrieve subscription object
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      // Extract relevant details
      const periodStart = new Date(subscription.current_period_start * 1000);
      const periodEnd = new Date(subscription.current_period_end * 1000);
      const price = (parseFloat(subscription.plan.amount_decimal) / 100).toFixed(2); // Convert cents to dollars
      const paid = await this.getTotalPaidAmount(subscriptionId); // Convert cents to dollars
      const amountDue = price; // Convert cents to dollars
      const nextPaymentDue = new Date(subscription.current_period_end * 1000);

      // Print subscription details
      return {
        start: periodStart,
        end: periodEnd,
        price: price,
        paid: paid,
        amountDue: amountDue,
        nextPaymentDue: nextPaymentDue,
        interval: subscription.plan.interval,
      };
    } catch (error) {
      console.error('Error getting subscription details:', error);
      throw new Error(error);
    }
  };

  public cancelSubscription = async (customerId, type) => {
    const customer = await stripe.customers.retrieve(customerId, {
      expand: ['subscriptions.data'],
    });

    if (type == 'private_club') {
      const activeMonthlySubscription = customer.subscriptions.data.find((item: any) => item.plan.id == ACTIVE_MONTHLY_PLAN_ID);
      const activeYearlySubscription = customer.subscriptions.data.find((item: any) => item.plan.id == ACTIVE_YEARLY_PLAN_ID);

      if (activeMonthlySubscription) {
        await stripe.subscriptions.update(activeMonthlySubscription.id, { cancel_at_period_end: true });
      }
      if (activeYearlySubscription) {
        await stripe.subscriptions.update(activeYearlySubscription.id, { cancel_at_period_end: true });
      }
    } else {
      const passiveSubscription = customer.subscriptions.data.find(
        (item: any) => item.plan.id != ACTIVE_MONTHLY_PLAN_ID && item.plan.id != ACTIVE_YEARLY_PLAN_ID,
      );

      if (passiveSubscription) {
        await stripe.subscriptions.update(passiveSubscription.id, { cancel_at_period_end: true });
      }
    }
  };

  public renewSubscription = async (customerId, type) => {
    const customer = await stripe.customers.retrieve(customerId, {
      expand: ['subscriptions.data'],
    });

    if (type == 'private_club') {
      const activeMonthlySubscription = customer.subscriptions.data.find((item: any) => item.plan.id == ACTIVE_MONTHLY_PLAN_ID);
      const activeYearlySubscription = customer.subscriptions.data.find((item: any) => item.plan.id == ACTIVE_YEARLY_PLAN_ID);

      if (activeMonthlySubscription) {
        await stripe.subscriptions.update(activeMonthlySubscription.id, { cancel_at_period_end: false });
      }
      if (activeYearlySubscription) {
        await stripe.subscriptions.update(activeYearlySubscription.id, { cancel_at_period_end: false });
      }
    } else {
      const passiveSubscription = customer.subscriptions.data.find(
        (item: any) => item.plan.id != ACTIVE_MONTHLY_PLAN_ID && item.plan.id != ACTIVE_YEARLY_PLAN_ID,
      );

      if (passiveSubscription) {
        await stripe.subscriptions.update(passiveSubscription.id, { cancel_at_period_end: false });
      }
    }
  };

  public getInvoicesList = async (customerId, type, startDate, endDate) => {
    const invoices = await this.getInvoicesListFromCustomerId(customerId, startDate, endDate);

    if (type === 'private_club') {
      const fileredInvoices = invoices.data.filter(item => this.checkOffer(item.lines.data[0]));
      return fileredInvoices;
    } else {
      const fileredInvoices = invoices.data.filter(item => !this.checkOffer(item.lines.data[0]));
      return fileredInvoices;
    }
  };

  public getSubscriptionStatusDetails = async customerId => {
    try {
      // Retrieve customer object
      const customer = await stripe.customers.retrieve(customerId, {
        expand: ['subscriptions.data'],
      });

      const defaultPaymentMethod = customer.invoice_settings.default_payment_method;
      const paymentMethod = await this.getPaymentMethodDetails(defaultPaymentMethod);

      // Check if the customer has active subscriptions
      const activeMonthlySubscription = customer.subscriptions.data.find((item: any) => item.plan.id == ACTIVE_MONTHLY_PLAN_ID);
      const activeYearlySubscription = customer.subscriptions.data.find((item: any) => item.plan.id == ACTIVE_YEARLY_PLAN_ID);

      const passiveSubscription = customer.subscriptions.data.find(
        (item: any) => item.plan.id != ACTIVE_MONTHLY_PLAN_ID && item.plan.id != ACTIVE_YEARLY_PLAN_ID,
      );

      let isActiveStatus = false;
      let isPassiveStatus = false;
      let activeSubscriptionDetails = {};
      let passiveSubscriptionDetails = {};

      if (activeMonthlySubscription) {
        if (activeMonthlySubscription.status == 'active') {
          isActiveStatus = true;
          activeSubscriptionDetails = await this.getSubscriptionDetailsFromId(activeMonthlySubscription.id);
        }
      }

      if (activeYearlySubscription) {
        if (activeYearlySubscription.status == 'active') {
          isActiveStatus = true;
          activeSubscriptionDetails = await this.getSubscriptionDetailsFromId(activeYearlySubscription.id);
        }
      }

      if (passiveSubscription) {
        if (passiveSubscription.status == 'active') {
          isPassiveStatus = true;
          passiveSubscriptionDetails = await this.getSubscriptionDetailsFromId(passiveSubscription.id);
        }
      }

      return {
        activeStatus: isActiveStatus,
        passiveStatus: isPassiveStatus,
        method: paymentMethod,
        activeSubscriptionDetails: activeSubscriptionDetails,
        passiveSubscriptionDetails: passiveSubscriptionDetails,
      };
    } catch (error) {
      console.error('Error checking subscription status2:', error);
    }
  };

  public updatePaymentMethod = async (paymentMethodId, customerId) => {
    try {
      // Attach the new payment method to the customer
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });

      // Set the new payment method as the default for invoices and subscriptions
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      const details = await this.getPaymentMethodDetails(paymentMethodId);
      return details;
    } catch (error) {
      console.error('Error updating payment method:', error);
    }
  };

  public getPaymentHistory = async customerId => {
    try {
      const customer = await stripe.customers.retrieve(customerId, {
        expand: ['subscriptions.data'],
      });

      const defaultPaymentMethod = customer.invoice_settings.default_payment_method;
      const paymentMethod = await this.getPaymentMethodDetails(defaultPaymentMethod);

      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit: 100, // Adjust the limit as needed to retrieve all invoices
      });

      const invoicesWithPaymentMethods: any = await Promise.all(
        invoices.data.map(async invoice => {
          if (invoice.payment_intent) {
            const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
            const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
            return {
              ...invoice,
              payment_method: {
                type: paymentMethod.type,
                brand: paymentMethod.card.brand,
                last4: paymentMethod.card.last4,
                cardName: paymentMethod.billing_details.name,
                exp_month: formatCardStringNumber(paymentMethod.card.exp_month),
                exp_year: formatCardStringNumber(paymentMethod.card.exp_year),
              },
            };
          }
          return invoice;
        }),
      );

      const history = invoicesWithPaymentMethods.map((item: any) => {
        return {
          offer: this.checkOffer(item.lines.data[0]) ? 'Private Club' : 'Quant Invest',
          status: item.status,
          date: new Date(item.effective_at * 1000),
          amount: (item.total / 100).toFixed(2),
          method: item.payment_method,
        };
      });

      return {
        paymentMethod,
        history,
      };
    } catch (error) {
      console.error('Error checking subscription status3:', error);
    }
  };
}
