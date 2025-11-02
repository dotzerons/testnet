import { useState } from "react";
import type { NextPage } from "next";
import { useWallet } from '@meshsdk/react';
import { CardanoWallet } from '@meshsdk/react';
import { mConStr0, MintingBlueprint } from "@meshsdk/core";
import { MeshTxBuilder, ForgeScript, resolveScriptHash, stringToHex } from '@meshsdk/core';
import type { Asset } from '@meshsdk/core';
import { BlockfrostProvider } from "@meshsdk/core";
import 'dotenv/config';
import {
  MeshWallet,
  serializePlutusScript,
  applyParamsToScript,
} from "@meshsdk/core";
import {
    builtinByteString
} from "@meshsdk/core";

import blueprint2 from "./plutus.json";
const blueprint = new MintingBlueprint("V2");
blueprint.noParamScript('58d501010029800aba2aba1aab9eaab9dab9a48888966002646465300130053754003300700398038012444b30013370e9000001c4c9289bae300a3009375400915980099b874800800e2646644944c02c004c02cc030004c024dd5002456600266e1d2004003899251300a3009375400915980099b874801800e2646644944dd698058009805980600098049baa0048acc004cdc3a40100071324a2601460126ea80122646644c6eb4c02c004c02cc030004c024dd5002200e401c8039007200e18031803800980300098019baa0068a4d13656400401');

const policyId2 = blueprint.hash
const scriptCbor2 = blueprint.cbor



const provider = new BlockfrostProvider('preprodKuj8qUlJZk22ZQP9ap6kuQUpMhYBIUPf');

const Home: NextPage = () => {
  const { connected, wallet } = useWallet();
  const [assets, setAssets] = useState<null | any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function getAssets() {
    if (wallet) {
      setLoading(true);
const tokenName = "MeshGiftCard";
const tokenNameHex = stringToHex("MeshGiftCard");
      const utxos = await wallet.getUtxos();
const changeAddress = await wallet.getChangeAddress();
const forgingScript = ForgeScript.withOneSignature(changeAddress);
  const firstUtxo = utxos[0];
/*
  const scriptCbor3 = applyParamsToScript( blueprint2.validators[0].compiledCode,
    [builtinByteString(tokenNameHex), firstUtxo],
    "JSON"
  );
*/
  const remainingUtxos = utxos.slice(1);
  if (firstUtxo === undefined) throw new Error("No UTXOs available");
 const scriptCbor = applyParamsToScript("58d501010029800aba2aba1aab9eaab9dab9a48888966002646465300130053754003300700398038012444b30013370e9000001c4c9289bae300a3009375400915980099b874800800e2646644944c02c004c02cc030004c024dd5002456600266e1d2004003899251300a3009375400915980099b874801800e2646644944dd698058009805980600098049baa0048acc004cdc3a40100071324a2601460126ea80122646644c6eb4c02c004c02cc030004c024dd5002200e401c8039007200e18031803800980300098019baa0068a4d13656400401", 
    [builtinByteString(stringToHex("MeshGiftCard"))],

    "JSON"
);




 const scriptAddr = serializePlutusScript(
  { code: scriptCbor, version: "V3" },
  undefined,
  0
).address;
;
const demoAssetMetadata = {
  name: "dot0",  // Nombre del token fungible
  symbol: "dot0",            // Símbolo del token
  description: "Token used to pay fees in dApp",
  decimals: 18,             // Decimales del token (puedes ajustarlo)
};

const policyId =resolveScriptHash(scriptCbor, "V3");

const metadata = { [policyId]: { [tokenName]: { ...demoAssetMetadata } } };

const txBuilder = new MeshTxBuilder({
  fetcher: provider, // get a provider https://meshjs.dev/providers
  verbose: true,
});

const unsignedTx = await txBuilder
    .txIn(
      firstUtxo.input.txHash,
      firstUtxo.input.outputIndex,
      firstUtxo.output.amount,
      firstUtxo.output.address
    )


  .mint("1000000000", policyId, tokenNameHex)
  .mintingScript(scriptCbor)
  .mintPlutusScript("V3")
  .mintRedeemerValue(mConStr0([]))
  .metadataValue(721, metadata)
  .changeAddress(changeAddress)
  .selectUtxosFrom(remainingUtxos)     
  .txOutInlineDatumValue([
      firstUtxo.input.txHash,
      firstUtxo.input.outputIndex,
      tokenNameHex,
    ]) 
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);

      setLoading(false);
    }
  }

  return (
    <div>      <input
        type="text"
        id="domain"
        placeholder="Ingrese el nombre"
      />
      <h1>Connect Wallet</h1>
      <CardanoWallet />
      {connected && (
        <>
          <h1>Get Wallet Assets</h1>
          {assets ? (
            <pre>
              <code className="language-js">
                {JSON.stringify(assets, null, 2)}
              </code>
            </pre>
          ) : (
            <button
              type="button"
              onClick={() => getAssets()}
              disabled={loading}
              style={{
                margin: "8px",
                backgroundColor: loading ? "orange" : "grey",
              }}
            >
              Get Wallet Assets
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Home;