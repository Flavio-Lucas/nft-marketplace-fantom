import { Component, OnInit } from '@angular/core';
import { ethers } from "ethers";
const privateKey = 'cc7fd53b7e2166c71c77aa4b4dae055d21c6ed459f9d16fefcf1e0c60557e15f';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor() {
    this.provider = new ethers.providers.Web3Provider((window as any).ethereum)
  }

  public contractAddress = '0xe2e4b4a18508C631F75E47435E7482fA98D6C246'

  public contractInstance: any;

  public abi: string = '';

  public provider: ethers.providers.Web3Provider;

  public address: string = '';

  public lastIndexGotten: number = 0;

  public list: {url: string, ownerOf: string}[] = [];

  public async connectWallet() {
    this.address = (await this.provider.send("eth_requestAccounts", []))[0];
  }

  public async uploadNft(event: string) {
    if (event === '' || !event.startsWith('http')) {
      alert('Você deve enviar uma url.')
      return;
    }

    if (!this.address) {
      alert('Conecte sua carteira para continuar sua transação.');
      return;
    }

    await this.contractInstance.safeMint(this.address, event);
    
    this.getListOfItems();
  }

  public async getListOfItems(): Promise<void> {
    let breakLoop = false;
    while (!breakLoop) {
      console.log(this.lastIndexGotten);
      const url = await this.contractInstance.tokenURI(this.lastIndexGotten).catch((e: any) => {
        console.log(e);
        breakLoop = true;
      });
      const ownerOf = await this.contractInstance.ownerOf(this.lastIndexGotten);
      if (breakLoop)
        break;
      this.list.push({
        url,
        ownerOf,
      });

      this.lastIndexGotten++;
    }
  }

  public async ngOnInit() {
    this.abi = await fetch('assets/utils/abi.json').then((response) => response.text()).then(text => text);
    // this.abi = //fs.readFileSync("abi.json").toString();
    this.provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const signer = this.provider.getSigner();
    this.contractInstance = new ethers.Contract(this.contractAddress, this.abi, signer);
    this.getListOfItems();
  }

}
