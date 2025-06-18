using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using NCalc;

namespace StudentFriendlyCalculator.Pages;

[IgnoreAntiforgeryToken]
public class ScientificCalcModel : PageModel
{
    private readonly ILogger<ScientificCalcModel> _logger;

    public ScientificCalcModel(ILogger<ScientificCalcModel> logger)
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
            var expr = new Expression(data.Name);
            var result = expr.Evaluate();
            return new JsonResult(new { result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Expression evaluation failed");
            return new JsonResult(new { error = "Invalid expression" });
        }
    }
}
