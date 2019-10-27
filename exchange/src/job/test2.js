{
	"timestamp": "2019-10-22T08:31:35.000",
	"producer": "eosio",
	"confirmed": 0,
	"previous": "011fe83f97c1f1374c10e4bc117d9b260224b6a5afc1ffe053a37361951e5acb",
	"transaction_mroot": "37c3c2b8cd308d7f8a705e8d3afa4b0f33f5a22913ff2e02c3724e4a29a04e6d",
	"action_mroot": "0cab9218d556da8caf0f847f6edc2248ed44f5fdc2ee95d040cacc53199dd62a",
	"schedule_version": 0,
	"new_producers": null,
	"header_extensions": [],
	"producer_signature": "SIG_K1_Km55UQnJ6gPWFBRGz6pnPh24hJDfa7tdATFwztmpBPXXJ3bJgW4LHdb5QUE7aup1AFvYCSUEwFbyENQxCMc3QDVRnEWUPx",
	"transactions": [
		{
			"status": "executed",
			"cpu_usage_us": 297,
			"net_usage_words": 20,
			"trx": {
				"id": "720928eb498635f2dcc525d916e0405c969fb942647dcd11b62f7f4927760e92",
				"signatures": [
					"SIG_K1_KXiJXxMaZpoUvgiZ6Htkps1Z2L7dneRGRkoSEHnW3rBmcWYEqZ5PNtNxeECqjzyRgvmmxVf7d2Jb3qSaH56QxhkX49JKxe"
				],
				"compression": "none",
				"packed_context_free_data": "",
				"context_free_data": [],
				"packed_trx": "82beae5d3ae8c8b3aa5b000000000100a6a3682a48b3d2000000572d3ccdcd01301d4553419ad9c900000000a8ed32323f301d4553419ad9c900a6a3682a48b3d250c300000000000004554500000000001e506f67324574683a746267746f6b656e636f696e3a352e3030303020554500",
				"transaction": {
					"expiration": "2019-10-22T08:32:02",
					"ref_block_num": 59450,
					"ref_block_prefix": 1537913800,
					"max_net_usage_words": 0,
					"max_cpu_usage_ms": 0,
					"delay_sec": 0,
					"context_free_actions": [],
					"actions": [
						{
							"account": "uetokencoin",
							"name": "transfer",
							"authorization": [
								{
									"actor": "tbgtokencoin",
									"permission": "active"
								}
							],
							"data": {
								"from": "tbgtokencoin",
								"to": "uetokencoin",
								"quantity": "5.0000 UE",
								"memo": "Pog2Eth:tbgtokencoin:5.0000 UE"
							},
							"hex_data": "301d4553419ad9c900a6a3682a48b3d250c300000000000004554500000000001e506f67324574683a746267746f6b656e636f696e3a352e30303030205545"
						}
					],
					"transaction_extensions": []
				}
			}
		},
		{
			"status": "executed",
			"cpu_usage_us": 330,
			"net_usage_words": 19,
			"trx": {
				"id": "a431ea5e0881bfd89b6e43587968be911f82f281d45a2a09d5d499cd1f249186",
				"signatures": [
					"SIG_K1_K67v2Ut4Cz9X8QKThfZc5EmL9wsgJr22NtiWmXgt2csrjs7AsoAxUbVcaW4MkvLK5TbKPBEH5da6MFM881gFtZJBvLoL6e"
				],
				"compression": "none",
				"packed_context_free_data": "",
				"context_free_data": [],
				"packed_trx": "82beae5d3ae8c8b3aa5b000000000100a6a3682a48b3d2000000572d3ccdcd01000000603afad8c900000000a8ed32323a000000603afad8c900a6a3682a48b3d2409c000000000000045545000000000019506f67324574683a7462676a6f696e3a342e3030303020554500",
				"transaction": {
					"expiration": "2019-10-22T08:32:02",
					"ref_block_num": 59450,
					"ref_block_prefix": 1537913800,
					"max_net_usage_words": 0,
					"max_cpu_usage_ms": 0,
					"delay_sec": 0,
					"context_free_actions": [],
					"actions": [
						{
							"account": "uetokencoin",
							"name": "transfer",
							"authorization": [
								{
									"actor": "tbgjoin",
									"permission": "active"
								}
							],
							"data": {
								"from": "tbgjoin",
								"to": "uetokencoin",
								"quantity": "4.0000 UE",
								"memo": "Pog2Eth:tbgjoin:4.0000 UE"
							},
							"hex_data": "000000603afad8c900a6a3682a48b3d2409c000000000000045545000000000019506f67324574683a7462676a6f696e3a342e30303030205545"
						}
					],
					"transaction_extensions": []
				}
			}
		}
	],
	"block_extensions": [],
	"id": "011fe840096445c6d6e1536e9d2335df4a6dc6362642cffc31e416b5d2cc7745",
	"block_num": 18868288,
	"ref_block_prefix": 1850991062
}





[
	{
		"expiration": "2019-10-22T08:32:02",
		"pog_txtid": "720928eb498635f2dcc525d916e0405c969fb942647dcd11b62f7f4927760e92",
		"actions": [
			{
				"account": "uetokencoin",
				"name": "transfer",
				"authorization": [
					{
						"actor": "tbgtokencoin",
						"permission": "active"
					}
				],
				"data": {
					"from": "tbgtokencoin",
					"to": "uetokencoin",
					"quantity": "5.0000 UE",
					"memo": "Pog2Eth:tbgtokencoin:5.0000 UE"
				},
				"hex_data": "301d4553419ad9c900a6a3682a48b3d250c300000000000004554500000000001e506f67324574683a746267746f6b656e636f696e3a352e30303030205545"
			}
		]
	},
	{
		"expiration": "2019-10-22T08:32:02",
		"pog_txtid": "a431ea5e0881bfd89b6e43587968be911f82f281d45a2a09d5d499cd1f249186",
		"actions": [
			{
				"account": "uetokencoin",
				"name": "transfer",
				"authorization": [
					{
						"actor": "tbgjoin",
						"permission": "active"
					}
				],
				"data": {
					"from": "tbgjoin",
					"to": "uetokencoin",
					"quantity": "4.0000 UE",
					"memo": "Pog2Eth:tbgjoin:4.0000 UE"
				},
				"hex_data": "000000603afad8c900a6a3682a48b3d2409c000000000000045545000000000019506f67324574683a7462676a6f696e3a342e30303030205545"
			}
		]
	}
]


