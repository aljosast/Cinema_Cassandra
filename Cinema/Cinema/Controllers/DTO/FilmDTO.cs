using Cinema.DBManager.Entities;
using System.Text;

namespace Cinema.Controllers.DTO
{
    public class FilmDTO
    {
        public string Id { get; set; }
        public string Naziv { get; set; }
        public string Zanr { get; set; }
        public string Opis { get; set; }
        public string DugiOpis { get; set; }
        public string Reziser { get; set; }
        public string? JsonGlumci { get; set; }
        public IFormFile? Slika { get; set; }

    }
}
