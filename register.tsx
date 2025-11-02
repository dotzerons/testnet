import { useState } from "react";
import type { NextPage } from "next";
import { useWallet } from '@meshsdk/react';
import { CardanoWallet } from '@meshsdk/react';
import { MeshTxBuilder, ForgeScript, resolveScriptHash, stringToHex, mConStr0, builtinByteString, outputReference, Mint, deserializeAddress } from '@meshsdk/core';
import { BlockfrostProvider } from "@meshsdk/core";

import 'dotenv/config';
import {
  MeshWallet,
  serializePlutusScript,
  applyParamsToScript,
} from "@meshsdk/core";
const compiledCode = '5902eb010100229800aba2aba1aba0aab9faab9eaab9dab9a9bae0024888888896600264646644b30013370e900018039baa001899911991192cc004c04400626464646644b30013370e900018089baa0018992cc004c05c006264b3001300c375a602800f13322598009919800800a400044b30013370e01000314a313259800acc0056600266e2520c201001899b89001483d00629410174528c566002b3001337129030000c4cdc4800a40e514a080ba29462600a00280b901744cc00c00ccdc00012400514a080b8c00c0050164566002b300133710900000344cdc4803240fd14a080a22b30013371f3001006803c0217180138acc0066002b30013002300148002294626004600266e00019200140514a14a280a22b30013370e6eb4c05800d66002601c00d1483403e2b30013370e00c90024520c8018acc004cdc38032400d1480a22900a2028405080a2266e3cdd7180a801a4504646f7430008a50405114a080a22941014452820288a5040506e1d205a371c00d14a08090c0580062c80a0cc020dd5980a980b18091baa30153012375400291011cce9fe5e0621b0a25144630a82c05dcb232f64716e853fef625ff5be8008b2020337020026e34034c8cc004004dd6180a003112cc004006298103d87a80008992cc004cdd7980b18099baa30163013375400260146602a9811e581c21133e28f9f9db50ab91126fc4163c79152851a041f021952c53da35004bd7044c028cc0540052f5c113300300330170024044602a0028098dc68009bae300d00130100018b201c330023756601e602060200026eb8c03cc030dd500291192cc004c014c030dd5000c52f5bded8c1137566020601a6ea800500b1919800800801912cc004006298103d87a8000899192cc004cdc8802800c56600266e3c0140062600e66024602000497ae08a60103d87a80004039133004004301400340386eb8c038004c04400500f1807180718051baa300d006370e90011ba5480022c8030c024004c024c028004c024004c010dd5004c52689b2b20041';
const utilitytoken='ce9fe5e0621b0a25144630a82c05dcb232f64716e853fef625ff5be8';
const paymentAddress = "addr_test1qqs3x03gl8uak59tjyfxl3qk83u322z35pqlqgv493fa5dt8y0pjhhc3hqj9cza9jw3cnd0nrxeuaul52hk95m94auhs2h5uku"; // Dirección a la que se enviarán los 10 ADA
const provider = new BlockfrostProvider('preprodKuj8qUlJZk22ZQP9ap6kuQUpMhYBIUPf');

const Home: NextPage = () => {
  const { connected, wallet } = useWallet();
  const [assets] = useState<null | any>(null);
  const [loading, setLoading] = useState<boolean>(false);

//console.log(deserializeAddress(paymentAddress))

function setTariff(n: number): String {
  if (n == 1) {
    return "1000";
  } else if (n == 2) {
    return "100";
  } else if (n == 3) {
    return "20";
  } else {
    return "10";
  }
}



  async function getAssets() {
    if (wallet) {
      setLoading(true);
const tld=(document.getElementById('tld') as HTMLInputElement).value;
const domain=(document.getElementById('domain') as HTMLInputElement).value;
const fqdn=domain+tld;
const tokenNameHex=stringToHex(fqdn);
const utxos = await wallet.getUtxos();
const collateral = (await wallet.getCollateral())[0];
const changeAddress = await wallet.getChangeAddress();
const scriptCode = applyParamsToScript(
    compiledCode,
    [builtinByteString(stringToHex(tld))],
    "JSON"
  );
 

  if (!utxos || utxos?.length === 0) {
    throw new Error("No utxos found");
  }
  if (!collateral) {
    throw new Error("No collateral found");
  }
  if (!changeAddress) {
    throw new Error("No wallet address found");
  }


const AssetMetadata = {
  name: fqdn,
  image: "https://dot.d0.to/nft.png",
  mediaType: "image/png",
  description: "Domain name",
  author: "https://dot.d0.to"
};
const policyId = resolveScriptHash(scriptCode, "V3");
const metadata = { [policyId]: { [fqdn]: { ...AssetMetadata } } };

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // get a provider https://meshjs.dev/providers
  verbose: true,
});

  const firstUtxo = utxos[0];
    const remainingUtxos = utxos.slice(1);
const unsignedTx = await txBuilder
   .txIn(
      firstUtxo.input.txHash,
      firstUtxo.input.outputIndex,
      firstUtxo.output.amount,
      firstUtxo.output.address
    )
    .mintPlutusScript("V3")
    .mint("1", policyId, tokenNameHex)
    .mintingScript(scriptCode)
    .metadataValue(721, metadata)
    .mintRedeemerValue(mConStr0([]))
       .txOut(
    paymentAddress,
    [
      {
        unit: utilitytoken + '646f7430', 
        quantity: setTariff(domain.length),
      },
    ]
  )
  // 2. Enviar el NFT al usuario
  .txOut(
    changeAddress,  // Dirección del usuario que recibe el NFT
    [
      {
        unit: policyId + tokenNameHex,  // El NFT mintado
        quantity: "1",                  // Enviamos 1 NFT
      },
    ]
  )
//    .txOutInlineDatumValue([
//      firstUtxo.input.txHash,
//      firstUtxo.input.outputIndex,
//      tokenNameHex,
//    ])
    .changeAddress(changeAddress)
        .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    )
    .selectUtxosFrom(remainingUtxos)
    .complete();
console.log(unsignedTx);
const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);

      setLoading(false);
    }
  }

  return (
    <div>
      <div>
      
            <input
        type="text"
        id="domain"
        placeholder="yourdomain"
      />
      <select id="tld">
      <option value=".d0.to">.d0.to</option>
      <option value=".ezz.to">.ezz.to</option>
      <option value=".ada.lat">.ada.lat</option>
      <option value=".crypto">.crypto</option>
    </select></div>
      <h1>Connect Wallet</h1>
      <CardanoWallet />
      {connected && (
        <>
          <h1>Register Domain</h1>
            <button
              type="button"
              onClick={() => getAssets()}
              disabled={loading}
              style={{
                margin: "8px",
                backgroundColor: loading ? "orange" : "grey",
              }}
            >
              Register Domain
            </button>
        </>
      )}
    </div>
  );
};

export default Home;