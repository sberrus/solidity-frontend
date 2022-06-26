import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { abi, contractAddress } from "./constants";

const App = () => {
	const [address, setAddress] = useState(null);
	const [fundAmmount, setFundAmmount] = useState<string>("0");

	useEffect(() => {
		checkIfMetamaskExists();
		return () => {
			// clean up ...
		};
	}, []);

	const checkIfMetamaskExists = () => {
		if (!window.ethereum) {
			alert("No tienes instalado metamask");
		} else {
			console.log("Si hay metamask");
		}
	};

	const handleConnectButton = async () => {
		try {
			const res =
				window.ethereum.request &&
				(await window.ethereum.request({
					method: "eth_requestAccounts",
				}));

			// Para evitar problemas con typescript
			if (res && Array.isArray(res)) {
				// Here you can access res[0]
				setAddress(res[0]);
			} else {
				// Handle errors here if accounts is not valid.
				alert("Error al obtener la cuenta de metamask");
			}
		} catch (error) {
			console.log(error);
		}
	};

	// Utilizando ethersjs para llamar al contrato y realizar el deploy del mismo.
	/**
	 * Llamando a método fund de contrato en solidity mediante ethersjs.
	 * dentro de la función estarán las indicaciones de lo que se necesita para ejecutar un método de un contrato inteligente
	 */
	const fund = async () => {
		// Requisitos que se necesitan para llamar a métodos de un contrato.
		/**
		 * Hay que saber que en cierta forma trabajamos parecido a como se trabaja con el deploy.js que se ha visto en
		 * hardhat. Por lo que tenemos que proveer a etherjs de cierta información para que este pueda leer, modificar y desplegar
		 * nuevos contratos. Pero primero debemos de proveerle de los siguientes parámetros.
		 *
		 * 1- provider / Conexión a la blockchain: Debemos conectar nuestra cartera a la app de manera que pueda leer la información de esta
		 * como su privateKey, la publicKey, el chainId etc...
		 *
		 * 2- signer / wallet / alguien con gas: Debemos obtener el address que va a realizar las interacciones con la app y consiguiente con el
		 * contrato inteligente.
		 *
		 * 3- ABI & Address del contrato que deseamos utilizar: Pues eso, el ABI y el address del contrato que vamos a utilizar en nuestra app o en este
		 * segmento.
		 */
		console.log("Funding with " + fundAmmount);
		// 1 - Obtenemos provider
		// Instancia del proveedor del address con el que vamos a trabajar
		/**
		 * El provider nos provee de la instancia de Metamask con la información del address que este conectada a nuestra app.
		 * Aquí podemos extraer las publicKeys y los métodos que nos permiten realizar request para ejecutar los métodos o transferir dinero
		 * desde esta cuenta a otra.
		 */
		const provider = new ethers.providers.Web3Provider(window.ethereum);

		// Instancia del signer.
		/**
		 * El signer es al que le vamos solicitar permiso para que ejecute la transacciones en la red. Digamos que es la
		 * instancia de nuestra wallet que interactua con el contrato.
		 */
		const signer = provider.getSigner();

		// Instancia del contrato
		/**
		 * Ya cuando tenemos los 3 necesarios para poder interactuar con el contrato, llamamos a
		 * ethers.Contract(contractAddressm, abi, signer) y le pasamos los argumentos en ese orden, de esta
		 * forma podemos interactuar con el contrato en cuestión.
		 */
		const contract = new ethers.Contract(contractAddress, abi, signer);

		// Interactuando con el contrato
		/**
		 * Ya con el contrato bien configurado, podemos interactuar con este de la misma forma como haciamos en hardhat.
		 *
		 * En este caso tenemos que enviar un objeto con la propiedad "value" y enviamos, con la ayuda de las herramientas de ethers
		 * el monto en eth al método ethers.utils.parseEther("cantidad"). Esta herramienta nos permite parsear un monto en ETH a WEI
		 * siendo esta la unidad con la que trabajan los smartContracts.
		 */
		try {
			const transactionResponse = await contract.fund({
				value: ethers.utils.parseEther(fundAmmount),
			});

			await listenForTransactionMine(transactionResponse, provider);

			console.log("Done!");
		} catch (error) {
			console.log(error);
		}
	};

	/**
	 * Crea un listener para que espere a la confirmación de la transacción y podemos ejecutar cierta lógica luego.
	 * @param transactionResponse
	 * @param provider
	 */
	const listenForTransactionMine = (
		transactionResponse: any,
		provider: ethers.providers.Web3Provider
	) => {
		console.log(`Minig ${transactionResponse.hash}...`);
		return new Promise((resolve) => {
			// provider.one()
			/**
			 * provider.once() es una función que nos permite crear listeners para ciertos eventos que podemos
			 * escuchar de ethers en la blockchain. También existe otro llamado provider.on() que nos permite escuchar eventos
			 * que podemos programar en los contratos de solidity.
			 */
			provider.once(transactionResponse.hash, (transactionReceipt) => {
				console.log(
					`Transacción finalizada con ${transactionReceipt.confirmations} confirmaciones`
				);
				resolve(null);
			});
		});
	};
	return (
		<div>
			<h1>Fund Me web3 App</h1>
			<hr />
			{address && (
				<>
					<h5>Current Wallet Address: {address}</h5>
				</>
			)}
			<button onClick={handleConnectButton} disabled={address ? true : false}>
				{address ? "Wallet Conectada" : "Conectar Wallet"}
			</button>
			<button
				onClick={() => {
					fund();
				}}
			>
				Fund
			</button>
			<input
				type="text"
				value={fundAmmount}
				onChange={(e) => {
					setFundAmmount(e.target.value);
				}}
			/>
		</div>
	);
};

export default App;
