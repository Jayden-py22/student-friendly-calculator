using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace StudentFriendlyCalculator.Pages;

[IgnoreAntiforgeryToken]
public class IndexModel : PageModel
{
    private readonly ILogger<IndexModel> _logger;

    public IndexModel(ILogger<IndexModel> logger)
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

    
    public IActionResult OnPostProcessName([FromBody] UserInput input)
    {
        Console.WriteLine("Received: " + input.Name); // or use a breakpoint
        string message = $"Hello, {input.Name}!";
        return new JsonResult(new { message });
    }
}
