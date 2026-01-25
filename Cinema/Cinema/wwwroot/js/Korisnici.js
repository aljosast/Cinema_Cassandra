import { DrawAdminHeader } from "./Navigation.js";

export class KorisniciPage {
    constructor(host) {
        this.host = host;
        this.data = []; 
    }

    async DrawPage() {
        this.host.innerHTML = "";
        DrawAdminHeader(this.host, "korisnici");

        const container = document.createElement("div");
        container.classList.add("Container");
        this.host.appendChild(container);

        const title = document.createElement("h2");
        title.innerText = "UPRAVLJANJE KORISNICIMA";
        title.style.borderBottom = "1px solid #333";
        title.style.paddingBottom = "15px";
        container.appendChild(title);

        const loading = document.createElement("h3");
        loading.innerText = "Učitavanje...";
        loading.style.color = "#39ff14";
        container.appendChild(loading);

        try {
            const token = localStorage.getItem("token");
            const resp = await fetch("https://localhost:7172/api/Korisnik/SviKorisnici", {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
        });
            if (!resp.ok) throw new Error("Greška servera");
            
            this.data = await resp.json();
            container.removeChild(loading);
            this.DrawList(container);

        } catch (e) {
            loading.innerText = "Greška: " + e.message;
            loading.style.color = "red";
        }
    }

    DrawList(container) {
        const listDiv = document.createElement("div");
        listDiv.style.marginTop = "30px";
        
        if(this.data.length === 0) {
            listDiv.innerHTML = "<h3>Nema registrovanih korisnika.</h3>";
        } else {
            // Header
            const headerRow = document.createElement("div");
            headerRow.className = "user-row header";
            headerRow.innerHTML = `
                <div style="flex:1; color:#39ff14; font-weight:bold;">USERNAME</div>
                <div style="flex:1; color:#39ff14; font-weight:bold;">IME I PREZIME</div>
                <div style="flex:1; color:#39ff14; font-weight:bold;">ULOGA</div>
                <div style="width: 320px; text-align:center; color:#39ff14; font-weight:bold;">AKCIJE</div>
            `;
            listDiv.appendChild(headerRow);

            // Redovi
            this.data.forEach(user => {
                const row = document.createElement("div");
                row.className = "user-row";
                
                row.innerHTML = `
                    <div style="flex:1">${user.username}</div>
                    <div style="flex:1">${user.ime} ${user.prezime}</div>
                    <div style="flex:1; color:${user.role === 'Admin' ? 'red' : '#ccc'}">${user.role}</div>
                `;

                const actionsDiv = document.createElement("div");
                actionsDiv.style.width = "320px";
                actionsDiv.style.display = "flex";
                actionsDiv.style.gap = "10px";
                actionsDiv.style.justifyContent = "center";

                const btnDetails = document.createElement("button");
                btnDetails.innerText = "DETALJI";
                btnDetails.className = "button";
                btnDetails.style.fontSize = "0.7rem";
                btnDetails.onclick = () => this.OpenUserModal(user, "details");
                actionsDiv.appendChild(btnDetails);

                const btnEdit = document.createElement("button");
                btnEdit.innerText = "IZMENI";
                btnEdit.className = "btn-edit";
                btnEdit.style.fontSize = "0.7rem";
                btnEdit.onclick = () => this.OpenUserModal(user, "edit");
                actionsDiv.appendChild(btnEdit);

                const btnDel = document.createElement("button");
                btnDel.innerText = "OBRIŠI";
                btnDel.className = "btn-delete";
                btnDel.style.fontSize = "0.7rem";
                btnDel.onclick = () => this.DeleteUser(user.username);
                actionsDiv.appendChild(btnDel);

                row.appendChild(actionsDiv);
                listDiv.appendChild(row);
            });
        }
        container.appendChild(listDiv);
    }

    OpenUserModal(user, mode) {
        const isEdit = mode === "edit";

        const modal = document.createElement("div");
        modal.classList.add("modal");
        modal.style.display = "block";

        const modalContent = document.createElement("div");
        modalContent.classList.add("neon-modal");

        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "&times;";
        closeBtn.className = "modal-close-icon";
        closeBtn.onclick = () => modal.remove();
        modalContent.appendChild(closeBtn);

        const title = document.createElement("h2");
        title.innerText = isEdit ? "IZMENI KORISNIKA" : "DETALJI KORISNIKA";
        modalContent.appendChild(title);

        const formDiv = document.createElement("div");
        
        const createInput = (lbl, val, type="text") => {
            const wrapper = document.createElement("div");
            wrapper.style.marginBottom = "15px";
            wrapper.innerHTML = `<div style="color:#39ff14; font-size:0.8rem; margin-bottom:5px;">${lbl}</div>`;
            
            const inp = document.createElement("input");
            inp.className = "input";
            inp.type = type;
            inp.value = val || ""; 
            
            if (!isEdit || (isEdit && lbl === "USERNAME")) {
                inp.disabled = true;
                inp.style.opacity = "0.6";
            }
            wrapper.appendChild(inp);
            formDiv.appendChild(wrapper);
            return inp;
        };

        const inUser = createInput("USERNAME", user.username);
        const inIme = createInput("IME", user.ime);
        const inPrez = createInput("PREZIME", user.prezime);
        const inGod = createInput("GODINE", user.godine, "number");

        modalContent.appendChild(formDiv);

        const btnRow = document.createElement("div");
        btnRow.style.marginTop = "20px";
        btnRow.style.display = "flex"; btnRow.style.gap = "10px";

        if (isEdit) {
            const btnSave = document.createElement("button");
            btnSave.innerText = "SAČUVAJ IZMENE";
            btnSave.className = "button";
            btnSave.style.background = "#39ff14"; 
            btnSave.style.color = "black"; 
            btnSave.style.width = "100%";
            
            btnSave.onclick = async () => {
                const obj = {
                    username: user.username,
                    ime: inIme.value,
                    prezime: inPrez.value,
                    godine: parseInt(inGod.value),
                    // Ovde samo vraćamo staru šifru nazad da se ne izgubi
                    password: user.password || user.Password, 
                    role: user.role
                };
                
                try {
                    const token = localStorage.getItem("token");
                    const r = await fetch("https://localhost:7172/api/Korisnik/EditAccount", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify(obj)
                    });
                    if(r.ok) {
                        alert("Podaci izmenjeni!");
                        modal.remove();
                        this.DrawPage();
                    } else {
                        alert("Greška: " + await r.text());
                    }
                } catch(e) { alert("Greška servera."); }
            };
            btnRow.appendChild(btnSave);
        }

        const btnClose = document.createElement("button");
        btnClose.innerText = "ZATVORI";
        btnClose.className = "button";
        btnClose.style.borderColor = "#555"; 
        btnClose.style.color = "#aaa"; 
        btnClose.style.width = "100%";
        btnClose.onclick = () => modal.remove();
        btnRow.appendChild(btnClose);

        modalContent.appendChild(btnRow);
        modal.appendChild(modalContent);
        this.host.appendChild(modal);
    }

    async DeleteUser(username) {
        if(!confirm(`Da li ste sigurni da želite da obrišete korisnika ${username}?`)) return;

        try {
            const token = localStorage.getItem("token");
            const r = await fetch("https://localhost:7172/api/Korisnik/DeleteAccount", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(username)
            });

            if(r.ok) {
                alert("Korisnik obrisan.");
                this.DrawPage();
            } else {
                alert("Greška: " + await r.text());
            }
        } catch(e) { console.error(e); }
    }
}