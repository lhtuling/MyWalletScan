import axios from "axios";

async function getStarkTx(address) {
    try {
        let tx = 0;
        let hasNextPage;
        let endCursor;
        const url = "https://starkscan.stellate.sh/";
        const headers = {
            'authority': 'starkscan.stellate.sh',
            'accept': 'application/json',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
            'content-type': 'application/json',
        }
        const Json_data = {
            'query': 'query TransactionsTableQuery(\n  $first: Int!\n  $after: String\n  $input: TransactionsInput!\n) {\n  ...TransactionsTablePaginationFragment_transactions_2DAjA4\n}\n\nfragment TransactionsTableExpandedItemFragment_transaction on Transaction {\n  entry_point_selector_name\n  calldata_decoded\n  entry_point_selector\n  calldata\n  initiator_address\n  initiator_identifier\n  main_calls {\n    selector\n    selector_name\n    calldata_decoded\n    selector_identifier\n    calldata\n    contract_address\n    contract_identifier\n    id\n  }\n}\n\nfragment TransactionsTablePaginationFragment_transactions_2DAjA4 on Query {\n  transactions(first: $first, after: $after, input: $input) {\n    edges {\n      node {\n        id\n        ...TransactionsTableRowFragment_transaction\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment TransactionsTableRowFragment_transaction on Transaction {\n  id\n  transaction_hash\n  block_number\n  transaction_status\n  transaction_type\n  timestamp\n  initiator_address\n  initiator_identifier\n  initiator {\n    is_social_verified\n    id\n  }\n  main_calls {\n    selector_identifier\n    id\n  }\n  ...TransactionsTableExpandedItemFragment_transaction\n}\n',
            'variables': {
                'first': 30,
                'after': null,
                'input': {
                    'initiator_address': address,
                    'transaction_types': [
                        'INVOKE_FUNCTION'
                    ],
                    'sort_by': 'timestamp',
                    'order_by': 'desc',
                    'min_block_number': null,
                    'max_block_number': null,
                    'min_timestamp': null,
                    'max_timestamp': null
                }
            }
        }
        const response = await axios.post(url, Json_data, {headers: headers});
        tx += response.data.data['transactions']['edges'].length;
        hasNextPage = response.data.data['transactions']['pageInfo']['hasNextPage'];
        const timestamp = response.data.data['transactions']['edges'][0]['node']['timestamp'];
        const latestDate = new Date(timestamp * 1000);
        let year = latestDate.getFullYear();
        let month = latestDate.getMonth() + 1;
        let date = latestDate.getDate();
        if (month < 10) month = '0' + month;
        if (date < 10) date = '0' + date;
        let formattedDate = `${year}/${month}/${date}`;
        
        debugger;

        const offset = 8;
        const utc8Date = new Date(latestDate.getTime() + offset * 3600 * 1000);
        const now = new Date();
        const utc8Now = new Date(now.getTime() + offset * 3600 * 1000);
        const diff = utc8Now - utc8Date;
        const diffInHours = Math.floor(diff / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);
        var fDate = "";
        if (diffInDays > 0) {
        fDate = `${diffInDays} 天前`;
        } else if (diffInHours > 0) {
        fDate = `${diffInHours} 小时前`;
        } else {
        fDate = "刚刚";
        }

        formattedDate = fDate;
        
        if (hasNextPage === true) {
            endCursor = response.data.data['transactions']['pageInfo']['endCursor'];
            while (hasNextPage) {
                Json_data['variables']['after'] = endCursor;
                const response = await axios.post(url, Json_data, {headers: headers});
                hasNextPage = response.data.data['transactions']['pageInfo']['hasNextPage'];
                endCursor = response.data.data['transactions']['pageInfo']['endCursor'];
                tx += response.data.data['transactions']['edges'].length;
            }
        }
        console.log(tx, formattedDate)
        return {tx: tx, stark_latest_tx: formattedDate};
    } catch (error) {
        console.error(error);
        return {tx: "Error", stark_latest_tx: "Error"};
    }
}

export default getStarkTx;
