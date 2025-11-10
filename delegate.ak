use aiken/collection/dict
use aiken/collection/list
use aiken/builtin
use aiken/collection/dict.{Dict, from_ascending_pairs_with}

use cardano/address.{Address, VerificationKey}
use cardano/assets.{PolicyId, from_asset, zero,quantity_of,add,AssetName, policies}
use cardano/transaction.{InlineDatum,Transaction} as tx
// following imports are for test use only
use mocktail.{complete, mint, mocktail_tx, tx_in, tx_out}
use mocktail/virgin_address.{mock_pub_key_address}
use mocktail/virgin_key_hash.{mock_policy_id}
use mocktail/virgin_output_reference.{mock_tx_hash}
fn create_address(pkh: ByteArray) -> Address {
    Address {
        payment_credential: VerificationKey( pkh ),
        stake_credential: None,
    }
}
//
pub type Datumd{
inner: ByteArray,
}
pub opaque type Value {
  inner: Dict<PolicyId, Dict<AssetName, Int>>,
}
fn revi(tok: ByteArray, i: Int, l: Int) -> Bool {
        if l==i {
          True
        } else {
		let ch = builtin.index_bytearray(tok, i)
                if (ch >= 97 && ch <= 122) || (ch >= 48 && ch <= 57) || ch == 45 {
                  revi(tok,i+1,l)
                } else {
                False
                }
        }
}

validator delegatens(tldpol: ByteArray) {
//fee wallet and tld defined in mesh
 mint(_rdmr: Data, policy_id: PolicyId, tx: Transaction) {
 let Transaction { mint, outputs, inputs, .. } = tx // grab inputs, mint and outputs only
// now grab minted asset ammount and name
 expect [Pair(asset_name, amount)] =
      mint
        |> assets.tokens(policy_id)
        |> dict.to_pairs()
// if its minting
if(amount == 1){
let feewallet=#"21133e28f9f9db50ab91126fc4163c79152851a041f021952c53da35"
let utility_id=#"ce9fe5e0621b0a25144630a82c05dcb232f64716e853fef625ff5be8"
let utilityname="dot0"

// check if its domain owner
 expect Some(hasdomain) = list.find(outputs,fn(output){
  quantity_of(output.value,tldpol, asset_name) == 1
})

//find payment of utility token
 expect Some(payment) =
  list.find(outputs,fn(output){output.address.payment_credential==VerificationKey(feewallet)})
 expect [Pair(utility, paid)] =
      payment.value
        |> assets.tokens(utility_id)
        |> dict.to_pairs()

//now check if minted token is being sent to backend
 expect [Pair(minting, one)] =
      payment.value
        |> assets.tokens(policy_id)
        |> dict.to_pairs()

//get datum and check
    expect Some(nft_output) =
      list.find(
        outputs,
        fn(output) { list.has(policies(output.value), policy_id) },
      )

    expect InlineDatum(datum) = nft_output.datum
    expect dele: ByteArray = datum
//    expect InlineDatum(dele) = nft_output.datum

//let dele2=builtin.serialise_data(dele)
//let longi=builtin.length_of_bytearray(dele2) // total lenght

//trace dele
  //return true if correctly paid, and delegation sent to backend
  minting==asset_name && one==1 && utility==utilityname && paid==1
// && (builtin.index_bytearray(dele, 0)==0 && (longi==9||longi==41))

  }else{
  //return true if its burning, we already validated if owner, payment not required
    amount == -1
  }
  }else(_){
    fail
  }
}

test sdgg() {
let pol=#"a9a8477a5ca6183597449aff4bc66eec6b3cdc60ba885683953ac0c3"
let valores = from_asset(#"ce9fe5e0621b0a25144630a82c05dcb232f64716e853fef625ff5be8"
, #"646f7430", 1)
    |> add("foo", "asset#1", 1)
    |> add("foo", "asset#2", 1)
    |> add("bar", "asset#2", 14)
let orig = from_asset("ASDF"
, "ASDA", 1)
    |> add("foo", "asset#1", 1)
    |> add(pol, "g.d0.to", 1)
    |> add("bar", "asset#2", 14)
  let domain_name = "g.d0.to"
  let tx =   mocktail_tx()
    |> tx_in(True, mock_tx_hash(0), 0, orig, mock_pub_key_address(0, None))
//    |> tx_out(True, mock_pub_key_address(0, None), orig)
    |> tx_out(True, mock_pub_key_address(0, None), valores)
    |> tx_out(True,create_address(#"21133e28f9f9db50ab91126fc4163c79152851a041f021952c53da35"), valores)
    |> tx_out(True, mock_pub_key_address(0, None), orig)
    |> mint(True, -1, mock_policy_id(0), domain_name)
    |> complete()
  delegatens.mint(pol,"", mock_policy_id(0), tx)
}
