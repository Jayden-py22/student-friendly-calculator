using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace StudentFriendlyCalculator.Pages
{
    public class ProgrammingCalcModel : PageModel
    {

        private readonly ILogger<ProgrammingCalcModel> _logger;

        public ProgrammingCalcModel(ILogger<ProgrammingCalcModel> logger)
        {
            _logger = logger;
        }
        public void OnGet()
        {
        }

        public class UserInput
        {
            public required string Name { get; set; }
        }

        public async Task<IActionResult> OnPostCalcSubmissionAsync()
        {
            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();
            var data = System.Text.Json.JsonSerializer.Deserialize<UserInput>(body);

            if (data == null || string.IsNullOrWhiteSpace(data.Name))
            {
                return new JsonResult(new { error = "Empty input" });
            }

            try
            {

                
                var Binary = Convert.ToInt32(data.Name, 2);//converts value to binary
                var Hex = Convert.ToInt32(data.Name, 16);// converts value to hexadecimal
                return new JsonResult(new {Binarydis = Binary, Hexdis = Hex });
                // other operations to be implemented
                // AND = &(val1, val2)
                // OR = |(val1, val2)
                // XOR = ^(val1, val2) *@
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Expression evaluation failed");
                return new JsonResult(new { error = "Invalid expression" });
            }
        }
    }
}
