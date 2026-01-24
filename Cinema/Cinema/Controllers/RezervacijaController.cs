using Cinema.DBManager.Entities;
using Cinema.DBManager.Providers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Cinema.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RezervacijaController : ControllerBase
    {
        RezervacijaProvider rezervacijaProvider { get; set; }

        public RezervacijaController( RezervacijaProvider r)
        {
            rezervacijaProvider = r;
        }

        [Authorize(Roles = "user")]
        [HttpPost("Rezervacija")]
        public async Task<IActionResult> SignUp([FromBody] Rezervacija rezervacija)
        {
            try
            {
                var response = rezervacijaProvider.InsertReservation(rezervacija);
                if (response.Success == false)
                {
                    if (response.Message == "Odgovor baze") response.Message = "Vec postojeci username";
                    return BadRequest(response.Message);
                }
                return Ok("Uspesna rezervacija");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [Authorize(Roles = "user")]
        [HttpDelete("DeleteReservation")]
        public async Task<IActionResult> DeleteReservation([FromBody] string username, string id)
        {
            try
            {
                var response = rezervacijaProvider.DeleteReservation(username,id);
                if (response.Success == false)
                {
                    if (response.Message == "Odgovor baze") response.Message = "Vec postojeci username";
                    return BadRequest(response.Message);
                }
                return Ok("Uspesno ste obrisali rezervaciju");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [Authorize(Roles = "user")]
        [HttpGet("ListaRezervacija/{username}")]
        public async Task<IActionResult> ListaRezervacija(string username)
        {
            try
            {
                var response = rezervacijaProvider.GetAllReservation(username);
                if (response == null)
                {
                    return BadRequest("Doslo je do greske pri preuzimanju podataka");
                }
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
