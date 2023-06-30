import boto3, json


def batch_put(food_list):
    DDB = boto3.resource('dynamodb', region_name='us-east-1')
    table = DDB.Table('FoodProducts')
    with table.batch_writer() as batch:
        for food in food_list:
            product_name = food['product_name_str']
            product_id = food['product_id_str']
            price_in_cents = food['price_in_cents_int']
            description = food['description_str']
            tags = food['tag_str_arr']
            formatted_data  = {
                'product_name': product_name,
                'product_id': product_id,
                'price_in_cents': price_in_cents,
                'description': description,
                'tags': tags
            }
            if 'special_int' in food:
                formatted_data['special'] = food['special_int']
                print("Adding special food item:", product_name, price_in_cents)
            else:
                print("Adding food item:", product_name, price_in_cents)
                pass
            batch.put_item(Item=formatted_data)

if __name__ == '__main__':
    with open("resources/website/all_products.json") as json_file:
        food_list = json.load(json_file)["product_item_arr"]
    batch_put(food_list)

