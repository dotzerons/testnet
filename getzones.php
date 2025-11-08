<?php
//TODO cargar todos los policy y zonas una vez que queden fijos los validadores
function gettld($in){
if($in=='a374cad75a3f5ca6f16565e8660866be4d96944167e8a175b383038a')return 'ezz.to';
return '';
}
function fromindx($in){
if($in==0)return 'ezz.to';
return '';
}
function getindx($in){
if($in=='ezz.to')return 0;
return '';
}

function is_validns($domain_name){
    return (preg_match("/^([a-z\d](-*[a-z\d])*)(\.([a-z\d](-*[a-z\d])*))*$/i", $domain_name) //valid chars check
            && preg_match("/^.{1,253}$/", $domain_name) //overall length check
            && preg_match("/^[^\.]{1,63}(\.[^\.]{1,63})*$/", $domain_name)   ); //length of each label
}
$url = 'http://23.152.40.109:1442/matches/*/*?resolve_hashes';
$json = file_get_contents($url);
if ($json === FALSE) {
    die('Error al obtener el JSON desde la URL');
}
$data = json_decode($json,true);

foreach ($data as $trx) {
        @$keys = array_keys($trx["value"]["assets"]);
        $TLD=gettld(substr($keys[1],0,56));
        if($TLD!=''&&$trx["address"]=='addr_test1qqs3x03gl8uak59tjyfxl3qk83u322z35pqlqgv493fa5dt8y0pjhhc3hqj9cza9jw3cnd0nrxeuaul52hk95m94auhs2h5uku'){
                $domain=hex2bin(substr($keys[1],57));
                $domain=substr($domain,0,strlen($domain)-strlen($TLD)-1);
                $TIM=$trx["created_at"]["slot_no"];
                if(@$TIM>$DEL[getindx($TLD)][$domain][0]){
                        foreach ($data as $sub) {
                                $DEL[getindx($TLD)][$domain][1]=$TIM;
                                if($sub['transaction_id']==$trx["transaction_id"]&&$sub['datum']!=''){
                                $datum=hex2bin(substr($sub['datum'],4));
                                        if($datum[0]==chr(0)){
                                        $L=strlen($datum);
                                                if($L==41||$L==9){
                                                        $DEL[getindx($TLD)][$domain][0]=substr($datum,1,8);
                                                        if(strlen($datum)==41)
                                                                $DEL[getindx($TLD)][$domain][4]=substr($datum,9);
                                                        else
                                                                $DEL[getindx($TLD)][$domain][4]='';
                                                        $DEL[getindx($TLD)][$domain][3]='1';
                                                }
                                        }else{
                                        $DEL[getindx($TLD)][$domain][3]='0';
                                        $ns=explode(' ',$datum);
                                                if(is_validns($ns[0])&&is_validns($ns[1])){
                                                        $DEL[getindx($TLD)][$domain][0]=$ns[0];
                                                        $DEL[getindx($TLD)][$domain][4]=$ns[1];
                                                }
                                        }
                                }
                        }
                }
        }
}
$i=0;//TODO completar y grabar las zonas en archivos
foreach ($DEL[$i] as $domain => $del) {
        if($del[3]=='1'){
                if($del[0]!=''){
                $ip1=ord($del[0][0]).'.'.ord($del[0][1]).'.'.ord($del[0][2]).'.'.ord($del[0][3]);
                $ip2=ord($del[0][4]).'.'.ord($del[0][5]).'.'.ord($del[0][6]).'.'.ord($del[0][7]);
                echo 'ns1.'.$domain.' IN A '.$ip1."\n".'ns2.'.$domain.' IN A '.$ip2."\n";
                        if($del[4]!=''){
                        $ip1=
bin2hex($del[4][0].$del[4][1]).':'.
bin2hex($del[4][2].$del[4][3]).':'.
bin2hex($del[4][4].$del[4][5]).':'.
bin2hex($del[4][6].$del[4][7]).':'.
bin2hex($del[4][8].$del[4][9]).':'.
bin2hex($del[4][10].$del[4][11]).':'.
bin2hex($del[4][12].$del[4][13]).':'.
bin2hex($del[4][14].$del[4][15]);
                        $ip2=
bin2hex($del[4][16].$del[4][17]).':'.
bin2hex($del[4][18].$del[4][19]).':'.
bin2hex($del[4][20].$del[4][21]).':'.
bin2hex($del[4][22].$del[4][23]).':'.
bin2hex($del[4][24].$del[4][25]).':'.
bin2hex($del[4][26].$del[4][27]).':'.
bin2hex($del[4][28].$del[4][29]).':'.
bin2hex($del[4][30].$del[4][31]);
                        echo 'ns1.'.$domain.' IN AAAA '.$ip1."\n".'ns2.'.$domain.' IN AAAA '.$ip2."\n";
                        }
                echo $domain.' IN NS ns1.'.$domain.'.'.fromindx($i).".\n".$domain.' IN NS ns2.'.$domain.'.'.fromindx($i).".\n";
                }
        }else{
                if($del[0]!=''&&$del[4]!='')echo $domain.' IN NS '.$del[0].".\n".$domain.' IN NS '.$del[4].".\n";
        }
}
