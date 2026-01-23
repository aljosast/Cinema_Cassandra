import { DrawCinemaEditPage } from "../pages/CinemaInsertEditPage.js";
import { DrawCinemaPage } from "../pages/CinemaPage.js";

export class Cinema{

    constructor(host, parentContainer, id, grad, naziv, adresa){
        this.host = host;
        this.parentContainer = parentContainer;
        this.id = id;
        this.grad = grad;
        this.naziv = naziv;
        this.adresa = adresa;

        this.modal = document.createElement("div");
        this.modal.classList.add("modal");
        this.parentContainer.appendChild(this.modal);
    }

    Kartica(container){

        const card = document.createElement("div");
        card.classList.add("CinemaCard");
        container.appendChild(card);

        card.onclick = () => this.Modal();

        const row1 = document.createElement("div");
        row1.innerText = "Naziv: " + this.naziv;
        card.appendChild(row1);

        const row2 = document.createElement("div");
        row2.innerText = "Grad: " + this.grad;
        card.appendChild(row2);

        const row3 = document.createElement("div");
        row3.innerText = "Adresa: " + this.adresa;
        card.appendChild(row3);
    }

    Modal(){
        this.modal.innerHTML = "";
        this.modal.style.display = "block";

        const content = document.createElement("div");
        content.classList.add("modal-content");
        this.modal.appendChild(content);

        const info = document.createElement("div");
        info.classList.add("Container");
        content.appendChild(info);

        info.innerHTML = `
            <div class="Row"><b>${this.naziv}</b></div>
            <div class="Row">Grad: ${this.grad}</div>
            <div class="Row">Adresa: ${this.adresa}</div>
        `;

        const btnRow = document.createElement("div");
        btnRow.classList.add("r");
        content.appendChild(btnRow);

        const editBtn = document.createElement("button");
        editBtn.innerText = "Izmeni";
        editBtn.classList.add("close-button");
        editBtn.onclick = () => {
            this.modal.style.display = "none";
            DrawCinemaEditPage(this.host, this.parentContainer, this.id, this.grad, this.naziv, this.adresa);
        };
        btnRow.appendChild(editBtn);

        const delBtn = document.createElement("button");
        delBtn.innerText = "Izbriši";
        delBtn.classList.add("close-button");
        delBtn.onclick = () => {
            this.Obrisi();
            this.parentContainer.remove();
        }
        btnRow.appendChild(delBtn);

        const closeBtn = document.createElement("button");
        closeBtn.innerText = "Zatvori";
        closeBtn.classList.add("close-button");
        closeBtn.onclick = () => this.modal.style.display = "none";
        btnRow.appendChild(closeBtn);
    }

    Obrisi(){
        fetch(`https://localhost:7172/api/Bioskop/ObrisiBioskop/${this.grad}/${this.id}`,{
            method:"DELETE"
        }).then(r=>{
            if(r.ok){
                this.modal.style.display = "none";
                this.parentContainer.innerHTML = "";
                DrawCinemaPage(this.host);
            }else{
                alert("Greška pri brisanju");
            }
        });
    }
}