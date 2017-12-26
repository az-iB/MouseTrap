# Edna

Javascript library for harvesting mouse and key press data including browser fingerprints, detection headless browser and client public IP.

This library was created to harvest data that will be used as data model for User Verification System via Mouse Movements and keystroke using TensorFlow

## Getting Started

include the js library in your website then start the main function by typing edna.start()

### Prerequisites

This library does not require any third party
You must change the endpoint ("api url") to save your data located at :
	src/record.js line 14

```
<script src="../build/edna.js" type="text/javascript"></script>
<script type="text/javascript">
	edna.start();
	var edna_publicKey = 'axcjd45x45kklzfa4545vsk';
</script>
```

### Installing

	git clone https://Oz-iB@bitbucket.org/Oz-iB/neattrap.git
	cd neattrap
	npm install
	npm run dev



## Running the tests

in progress


## Deployment

npm run build

## Authors

* **ouzza Brahim** - *Initial work* - [az-iB](https://github.com/az-iB)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
