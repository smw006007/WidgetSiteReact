import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import { BigNumber } from 'ethers';

export default async function strategy(
  space,
  network,
  provider,
  addresses,
  options,
  snapshot
) {
  const abi = [
    'function balanceOf(address account) view returns (uint256)',
    'function getVotes(address account) view returns (uint256)'
  ];

  const response = await multicall(
    network,
    provider,
    abi,
    [
      ...addresses.map((address) => [
        '0xAcd2c239012D17BEB128B0944D49015104113650',
        'balanceOf',
        [address.toLowerCase()]
      ]),
      ...addresses.map((address) => [
        '0xAcd2c239012D17BEB128B0944D49015104113650',
        'getVotes',
        [address.toLowerCase()]
      ])
    ],
    { blockTag: snapshot }
  );

  const votingPower = {};
  addresses.forEach((address, index) => {
    const balanceOf = Number(BigNumber.from(response[index]).toString());
    const delegatedVotes = Number(BigNumber.from(response[index + addresses.length]).toString());
    votingPower[address.toLowerCase()] = balanceOf + delegatedVotes;
  });

  return votingPower;
}