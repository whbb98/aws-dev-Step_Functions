// https://www.npmjs.com/package/sqs-consumer
const {Consumer} = require('sqs-consumer');
const cacheTtlInSec = 300;
const memcached = require('../cache/memcache');
// example SQS payload
// {
//     "Type": "Notification",
//     "MessageId": "de85618e-71b6-5670-ae64-38e4e8fd079c",
//     "SequenceNumber": "10000000000000000012",
//     "TopicArn": "arn:aws:sns:us-west-2:559625953091:updated_beans.fifo",
//     "Message": "4:liberica:0",
//     "Timestamp": "2021-07-15T20:14:03.540Z",
//     "UnsubscribeURL": "https://sns.us-west-2.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-west-2:559625953091:updated_beans.fifo:31719c7b-e993-49cb-864f-98ab539da17b",
//     "MessageAttributes": {
//     "inventory_alert": {
//         "Type": "String",
//             "Value": "out_of_stock"
//         }
//     }
// }
let config = {
    VISIBILITY_TIMEOUT_IN_SEC: 5,
    LONG_POLL_WAIT_IN_SEC: 20
}

Object.keys(config).forEach(key => {
    if (process.env[key] === undefined) {
        console.log(`[NOTICE] Value for key '${key}' not found in ENV, using default value.  See app/sqs/consumer.js`)
    } else {
        config[key] = process.env[key]
    }
});


module.exports = bean_model => {
    const sqs_endpoint = get_sqs_endpoint()
    if (sqs_endpoint) {
        const sqs_consumer = Consumer.create({
            queueUrl: sqs_endpoint,
            batchSize: 1,
            visibilityTimeout: config.VISIBILITY_TIMEOUT_IN_SEC,
            waitTimeSeconds: config.LONG_POLL_WAIT_IN_SEC,
            handleMessage: async (message) => {
                bean_attributes = parse_message(message)
                bean_model.getBeanBySupplierIdType(
                    bean_attributes.supplier_id,
                    bean_attributes.bean_type,
                    (err, bean) => {
                        if (err) {
                            console.log("Error retrieving bean of type ", bean_attributes.bean_type, "for supplier",
                                bean_attributes.supplier_id, "error:", err)
                            // %%%%%% not sure what to do here to fail processing and leave the item in the
                            //        queue. `return false` is NOT the right thing)
                            // https://www.npmjs.com/package/sqs-consumer
                            // Doc states: Throwing an error (or returning a rejected promise) from the handler function
                            //             will cause the message to be left on the queue.
                            return false
                        }
                        bean.quantity = Number(bean_attributes.quantity) + Number(bean.quantity)
                        bean_model.updateById(bean.id, bean, (err, data) => {
                            if (err) {
                                console.log("Error updating bean quantity: ", err)
                                // %%%%%% not sure what to do here to fail processing and leave the item in the
                                //        queue.  `return false` is NOT the right thing)
                                // https://www.npmjs.com/package/sqs-consumer
                                // Doc states: Throwing an error (or returning a rejected promise) from the handler
                                //             function will cause the message to be left on the queue.
                                return false
                            }
                            // Write-through logic: add this new record to the cache
                            memcached.set('beans_' + bean.id, JSON.stringify(bean), cacheTtlInSec, function (err) {
                                if (err) {
                                    console.error("Unable to clear cache for bean with id:", bean.id, "Error:", err)
                                } else {
                                    console.log("Cleared cache for bean with id:", bean.id)
                                }
                            });
                            // FindAll is now stale
                            memcached.del('beans_all', function (err) {
                                if (err) {
                                    console.error("Unable to clear 'beans_all' cache. Error:", err)
                                } else {
                                    console.log("Cleared cache for 'beans_all' result")
                                }
                            });
                        });
                    }
                );
            }
        });
        sqs_consumer.on('error', (err) => {
            console.error('SQS Event [error]: ', err.message);
        });
        sqs_consumer.on('processing_error', (err) => {
            console.error('SQS Event [processing_error]: ', err.message);
        });
        console.log("Polling of SQS:", sqs_consumer.queueUrl, ", Visibility Timeout: ", sqs_consumer.visibilityTimeout,
            ", Long-poll waitTimeSeconds: ", sqs_consumer.waitTimeSeconds)
        sqs_consumer.start();

    } else {
        console.log("ENV var 'SQS_ENDPOINT' not found.  No polling of SQS")
    }
}

function get_sqs_endpoint() {
    if (process.env["SQS_ENDPOINT"] === undefined) {
        console.log("SQS endpoint not found")
        return false
    }
    return process.env["SQS_ENDPOINT"]
}

function parse_message(message_item) {
    message_body = JSON.parse(message_item.Body)
    message = message_body.Message
    console.log("SQS message field: ", message)
    message_segments = message.split(':').map(e => e.trim())
    fields = {supplier_id: message_segments[0], bean_type: message_segments[1], quantity: message_segments[2]}
    console.log("SQS message parsed as: ", fields)
    return fields
}