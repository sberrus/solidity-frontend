import React, { useEffect, useState } from "react";

const App = () => {
	const [metamaskProvider] = useState(() => window.ethereum);
	const [address, setAddress] = useState(null);

	useEffect(() => {
		checkIfMetamaskExists();
		return () => {
			// clean up ...
		};
	}, []);

	const checkIfMetamaskExists = () => {
		if (!metamaskProvider) {
			alert("No tienes instalado metamask");
		} else {
			console.log("Si hay metamask");
		}
	};

	const handleConnectButton = async () => {
		try {
			const res = await metamaskProvider.request({
				method: "eth_requestAccounts",
			});

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
		</div>
	);
};

export default App;
