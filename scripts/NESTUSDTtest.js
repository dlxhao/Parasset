const hre = require("hardhat");
const { ethers } = require("hardhat");
const {USDT,ETH,deployUSDT,deployNEST,deployNestQuery,deployInsurancePool,depolyFactory,setInsurancePool,setMortgagePool,
	setPrice,setMaxRate,setQuaryAddress,setPTokenOperator,setFlag,setFlag2,
	deployMortgagePool,approve,createPtoken,setInfo,getPTokenAddress,
	getTokenInfo,allow,coin,getLedger,supplement,
	getFee,ERC20Balance,redemptionAll,decrease,increaseCoinage,reducedCoinage,
	exchangePTokenToUnderlying,exchangeUnderlyingToPToken,transfer,getTotalSupply,getBalances,subscribeIns,redemptionIns} = require("./normal-scripts.js");

async function main() {
	const accounts = await ethers.getSigners();
	// 准备工作
	USDTContract = await deployUSDT();
	NESTContract = await deployNEST();
	factory = await depolyFactory();
	NestQuery = await deployNestQuery();
	pool = await deployMortgagePool(factory.address);
	insurancePool = await deployInsurancePool(factory.address);
	await approve(USDTContract.address, pool.address, USDT("999999"));
	await approve(NESTContract.address, pool.address, ETH("999999"));
	await setInsurancePool(pool.address, insurancePool.address);
	await setMortgagePool(insurancePool.address, pool.address);
	await createPtoken(factory.address, "USDT");
	await setPTokenOperator(factory.address, pool.address, "1");
	await setPTokenOperator(factory.address, insurancePool.address, "1");
	await setFlag(pool.address, "1");
	await setFlag2(insurancePool.address, "1");
	const USDTPToken = await getPTokenAddress(factory.address, "0");
	await setInfo(pool.address, USDTContract.address, USDTPToken);
	await allow(pool.address, USDTPToken, NESTContract.address);
	await setMaxRate(pool.address, NESTContract.address, "70");
	await setPrice(NestQuery.address,NESTContract.address, ETH("1"));
	await setPrice(NestQuery.address,USDTContract.address, USDT("1"));
	await setQuaryAddress(pool.address,NestQuery.address);
	await approve(USDTPToken, pool.address, ETH("999999"));


	// 铸币
	await coin(pool.address, NESTContract.address, USDTPToken, ETH("4"), "50", "20000000000000000");
	const ledger = await getLedger(pool.address, USDTPToken, NESTContract.address);

	// 增加抵押
	await supplement(pool.address, NESTContract.address, USDTPToken, ETH("2"), "20000000000000000");
	await getLedger(pool.address, USDTPToken, NESTContract.address);
	await ERC20Balance(USDTPToken, insurancePool.address);
	// 减少抵押
	await decrease(pool.address, NESTContract.address, USDTPToken, ETH("1"), "20000000000000000");
	await getLedger(pool.address, USDTPToken, NESTContract.address);
	await ERC20Balance(USDTPToken, insurancePool.address);
	// 新增铸币
	await increaseCoinage(pool.address, NESTContract.address, USDTPToken, ETH("1"), "20000000000000000");
	await getLedger(pool.address, USDTPToken, NESTContract.address);
	// 减少铸币
	await reducedCoinage(pool.address, NESTContract.address, USDTPToken, ETH("1"), "20000000000000000");
	await getLedger(pool.address, USDTPToken, NESTContract.address);
	// 赎回
	// await redemptionAll(pool.address, NESTContract.address, USDTPToken);
	// await getLedger(pool.address, USDTPToken, NESTContract.address);
	await ERC20Balance(USDTPToken, insurancePool.address);

	// 认购保险
	await approve(USDTContract.address, insurancePool.address, USDT("999999"));
	await approve(USDTPToken, insurancePool.address, ETH("999999"));
	await getBalances(insurancePool.address, USDTContract.address, accounts[0].address);
	await subscribeIns(insurancePool.address, USDTContract.address, USDT(2));
	await getBalances(insurancePool.address, USDTContract.address, accounts[0].address);
	// 兑换
	await ERC20Balance(USDTPToken, insurancePool.address);
	await exchangePTokenToUnderlying(insurancePool.address, USDTPToken, ETH("1"));
	await ERC20Balance(USDTPToken, insurancePool.address);

	await ERC20Balance(USDTContract.address, insurancePool.address);
	await exchangeUnderlyingToPToken(insurancePool.address, USDTContract.address, USDT("1"));
	await ERC20Balance(USDTContract.address, insurancePool.address);

	// 赎回保险--本地私链测试时注释掉，被冻结无法测试
	await ERC20Balance(USDTContract.address, insurancePool.address);
	await ERC20Balance(USDTContract.address, accounts[0].address);
	await getBalances(insurancePool.address, USDTContract.address, accounts[0].address);
	await ERC20Balance(USDTPToken, insurancePool.address);
	await redemptionIns(insurancePool.address, USDTContract.address, ETH("2"));
	await ERC20Balance(USDTContract.address, insurancePool.address);
	await ERC20Balance(USDTContract.address, accounts[0].address);
	await getBalances(insurancePool.address, USDTContract.address, accounts[0].address);
	await ERC20Balance(USDTPToken, insurancePool.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
});