use aiken/collection/dict
use aiken/collection/list
use aiken/builtin
use cardano/address.{Address, VerificationKey}
use cardano/assets.{PolicyId, from_asset, zero}
use cardano/transaction.{Transaction} as tx
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
fn setariff(n: Int) -> Int {
  if n == 1 {
    1000
  } else if n == 2 {
    100
  } else if n == 3 {
    20
  } else {
    10
  }
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

validator registertld(tld: ByteArray) {
//fee wallet and tld defined in mesh
 mint(_rdmr: Data, policy_id: PolicyId, tx: Transaction) {
let feewallet=#"21133e28f9f9db50ab91126fc4163c79152851a041f021952c53da35"
let utility_id=#"ce9fe5e0621b0a25144630a82c05dcb232f64716e853fef625ff5be8"
let utilityname="dot0"
 let charstld=builtin.length_of_bytearray(tld) // lenght of tld ".d0.to" = 6
 let Transaction { mint, outputs, .. } = tx // grab inputs, mint and outputs only
// now grab minted asset ammount and name
 expect [Pair(asset_name, amount)] =
      mint
        |> assets.tokens(policy_id)
        |> dict.to_pairs()
// now we check name is a valid domain name
 let longi=builtin.length_of_bytearray(asset_name) // total lenght
 let domainlong=longi-charstld //lenght of domain only
 let hayguiones=!(builtin.index_bytearray(asset_name, 0)==45 || builtin.index_bytearray(asset_name, domainlong-1)==45) // cant start or end with -
 let is_valid = revi(asset_name,0,domainlong) // a-z 0-9 and - only
//find payment
 expect Some(payment) =
  list.find(outputs,fn(output){output.address.payment_credential==VerificationKey(feewallet)})
 expect [Pair(utility, paid)] =
      payment.value
        |> assets.tokens(utility_id)
        |> dict.to_pairs()
//return validation bool
// only 1 NFT + valid domain lenght + valid TLD + no start/end- + payment ok
amount == 1  && is_valid && (domainlong > 0 && domainlong <= 63) && builtin.slice_bytearray(domainlong, longi, asset_name) == tld && hayguiones && paid==setariff(domainlong) && utility==utilityname
  }  else(_) {
    fail
  }
}

test sdgg() {
let tld=".d0.to"
let valores = from_asset(#"ce9fe5e0621b0a25144630a82c05dcb232f64716e853fef625ff5be8"
, #"646f7430", 1000)
  let domain_name = "g.d0.to"
  let tx =   mocktail_tx()
    |> tx_in(True, mock_tx_hash(0), 0, zero, mock_pub_key_address(0, None))
    |> tx_out(True, mock_pub_key_address(0, None), valores)
    |> tx_out(True,create_address(#"21133e28f9f9db50ab91126fc4163c79152851a041f021952c53da35"), valores)
    |> tx_out(True, mock_pub_key_address(0, None), valores)
    |> mint(True, 1, mock_policy_id(0), domain_name)
    |> complete()
  registertld.mint(tld,"", mock_policy_id(0), tx)
}