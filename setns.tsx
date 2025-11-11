use aiken/collection/dict
use aiken/collection/list
use aiken/builtin
use aiken/collection/dict.{Dict}

use cardano/address.{Address, VerificationKey}
use cardano/assets.{PolicyId, quantity_of,AssetName, policies}
use cardano/transaction.{InlineDatum,Transaction} as tx

fn revispaces(tok: ByteArray, i: Int, l: Int) -> Bool {
        if l==i || i==255 { //reached end with no space or first dns bigger than RFC
          False
        } else {
		let ch = builtin.index_bytearray(tok, i)
                if (ch == 32) { //find the space and get ns1,ns2, extra spaces will cause fail
		revidots(builtin.slice_bytearray(0, i, tok),0,i) &&
		revidots(builtin.slice_bytearray(i+1, l, tok),0,l-i-1)
                } else {
                revispaces(tok,i+1,l)
                }
        }
}

fn revidots(tok: ByteArray, i: Int, l: Int) -> Bool { //add ,last: Int if you want to limit labels
//RFC allows one label delegations for local testing purpose
//there is no max limit, but lenght limits to 127 labels using 1 char subdomains (example ipv6 .arpa)
        if (l==i) {
		let label=builtin.slice_bytearray(0, i, tok)
		let hayg=!(builtin.index_bytearray(label, 0)==45 || builtin.index_bytearray(label, i-1)==45)
i > 0 && i <= 63 && hayg &&
		revi(label,0,i)
        } else {
		let ch = builtin.index_bytearray(tok, i)
                if (ch == 46) { //find the space and get ns1,ns2, extra spaces will cause fail
//we got here ns1 sent to revi and "domain.tld" continue checking
let label=builtin.slice_bytearray(0, i, tok)
let hayg=!(builtin.index_bytearray(label, 0)==45 || builtin.index_bytearray(label, i-1)==45)

i > 0 && i <= 63 && hayg &&
		revi(label,0,i) &&
 		revidots(builtin.slice_bytearray(i+1, l, tok),0,l-i-1)//,last+1 check rest of tld
                } else {
                revidots(tok,i+1,l)//,last
                }
        }
}

//
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
 let Transaction { mint, outputs, .. } = tx // grab inputs, mint and outputs only
// now grab minted asset ammount and name
 expect [Pair(asset_name, amount)] =
      mint
        |> assets.tokens(policy_id)
        |> dict.to_pairs()

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
let longi=builtin.length_of_bytearray(dele) // total lenght

  //return true if correctly paid, and delegation sent to backend
  minting==asset_name && one==1 && utility==utilityname && paid==1 &&amount == 1
 && 

//00 is self delegated, else NS
if(builtin.index_bytearray(dele, 0)==0){
	(longi==9||longi==41)        //lenght 9 only v4, 41 v4+v6
}else{
//check ns and lenght, is cheaper to check len first
	longi < 509 && revispaces(dele,0,longi)
}
  }else(_){
    fail
  }
}
