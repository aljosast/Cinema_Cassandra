import { DrawCinemaPage } from "./CinemaPage.js";

export function DrawCinemaInsertPage(host, parentContainer){

    parentContainer.innerHTML = "";
    parentContainer.className = "cinemaEditPage";

    const backBtn = document.createElement("button");
    backBtn.innerText = "Nazad";
    backBtn.classList.add("button");
    backBtn.onclick = () => {
        parentContainer.remove();
        DrawCinemaPage(host);
    };
    parentContainer.appendChild(backBtn);

    const form = document.createElement("form");
    parentContainer.appendChild(form);

    form.onsubmit = (e) => {
        e.preventDefault();

        const obj = {
            ID: "",
            Grad: gradBox.value,
            Naziv: nazivBox.value,
            Adresa: adresaBox.value
        };

        fetch("https://localhost:7172/api/Bioskop/DodajBioskop",{
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body: JSON.stringify(obj)
        }).then(r=>{
            if(r.ok){
                parentContainer.remove();
                DrawCinemaPage(host);
            }else{
                alert("Greška pri dodavanju");
            }
        });
    };

    // Grad

    const gRow = document.createElement("div");
    gRow.classList.add("row");
    form.appendChild(gRow);

    const gLabel = document.createElement("div");
    gLabel.innerText = "Grad:";
    gLabel.classList.add("label");
    gRow.appendChild(gLabel);

    const gradBox = document.createElement("input");
    gRow.appendChild(gradBox);

    // Naziv

    const nRow = document.createElement("div");
    nRow.classList.add("row");
    form.appendChild(nRow);

    const nLabel = document.createElement("div");
    nLabel.innerText = "Naziv:";
    nLabel.classList.add("label");
    nRow.appendChild(nLabel);

    const nazivBox = document.createElement("input");
    nRow.appendChild(nazivBox);

    // Adresa

    const aRow = document.createElement("div");
    aRow.classList.add("row");
    form.appendChild(aRow);

    const aLabel = document.createElement("div");
    aLabel.innerText = "Adresa:";
    aLabel.classList.add("label");
    aRow.appendChild(aLabel);

    const adresaBox = document.createElement("input");
    aRow.appendChild(adresaBox);

    const sub = document.createElement("input");
    sub.type = "submit";
    sub.value = "Dodaj bioskop";
    form.appendChild(sub);
}

export function DrawCinemaEditPage(host, parentContainer, id, grad, naziv, adresa){

    parentContainer.innerHTML = "";
    parentContainer.className = "cinemaEditPage";

    const backBtn = document.createElement("button");
    backBtn.innerText = "Nazad";
    backBtn.classList.add("button");
    backBtn.onclick = () => {
        parentContainer.remove();
        DrawCinemaPage(host);
    };
    parentContainer.appendChild(backBtn);

    const form = document.createElement("form");
    parentContainer.appendChild(form);

    form.onsubmit = (e) => {
        e.preventDefault();

        const obj = {
            ID: id,
            Grad: grad,
            Naziv: nazivBox.value,
            Adresa: adresaBox.value
        };

        fetch("https://localhost:7172/api/Bioskop/IzmeniBioskop",{
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify(obj)
        }).then(r=>{
            if(r.ok){
                parentContainer.remove();
                DrawCinemaPage(host);
            }else{
                alert("Greška pri izmeni");
            }
        });
    };

    // Grad (readonly)

    const gRow = document.createElement("div");
    gRow.classList.add("row");
    form.appendChild(gRow);

    const gLabel = document.createElement("div");
    gLabel.innerText = "Grad:";
    gLabel.classList.add("label");
    gRow.appendChild(gLabel);

    const gVal = document.createElement("div");
    gVal.innerText = grad;
    gRow.appendChild(gVal);

    // Naziv

    const nRow = document.createElement("div");
    nRow.classList.add("row");
    form.appendChild(nRow);

    const nLabel = document.createElement("div");
    nLabel.innerText = "Naziv:";
    nLabel.classList.add("label");
    nRow.appendChild(nLabel);

    const nazivBox = document.createElement("input");
    nazivBox.value = naziv;
    nRow.appendChild(nazivBox);

    // Adresa

    const aRow = document.createElement("div");
    aRow.classList.add("row");
    form.appendChild(aRow);

    const aLabel = document.createElement("div");
    aLabel.innerText = "Adresa:";
    aLabel.classList.add("label");
    aRow.appendChild(aLabel);

    const adresaBox = document.createElement("input");
    adresaBox.value = adresa;
    aRow.appendChild(adresaBox);

    const sub = document.createElement("input");
    sub.type = "submit";
    sub.value = "Sačuvaj izmene";
    form.appendChild(sub);
}