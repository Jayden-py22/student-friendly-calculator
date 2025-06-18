using NCalc;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace StudentFriendlyCalculator.Pages
{
    // PageModel class: handles data and user actions for the Razor Page above.
    [IgnoreAntiforgeryToken]
    public class EquationSolverModel : PageModel
    {
        // Automatically binds the form field named "Equation" to this property on POST.
        [BindProperty]
        public string Equation { get; set; } = string.Empty;

        // This will hold the computed solution so the view can render it.
        public string? Solution { get; private set; }

        // OnGet runs on HTTP GET requests; no data needs initialization here.
        public void OnGet()
        {
        }

        // OnPostSolve runs on HTTP POST when the form targets handler "Solve".
        public void OnPostSolve()
        {
            // Split the input into left and right parts at the '=' sign
            var parts = Equation.Split('=');
            if (parts.Length != 2)
            {
                Solution = "Please enter an equation with exactly one '=' sign.";
                return;
            }

            try
            {
                // Evaluate left side at x=0 to get the constant term 'b'
                var leftAtZero = new Expression(parts[0]);
                leftAtZero.EvaluateParameter += (name, args) =>
                {
                    if (name == "x") args.Result = 0;
                };
                double b = Convert.ToDouble(leftAtZero.Evaluate());

                // Evaluate left side at x=1 to get 'a + b'
                var leftAtOne = new Expression(parts[0]);
                leftAtOne.EvaluateParameter += (name, args) =>
                {
                    if (name == "x") args.Result = 1;
                };
                double aPlusB = Convert.ToDouble(leftAtOne.Evaluate());

                // Coefficient 'a' is (a + b) - b
                double a = aPlusB - b;

                // Evaluate the right side to get constant 'c'
                var rightExpr = new Expression(parts[1]);
                double c = Convert.ToDouble(rightExpr.Evaluate());

                if (Math.Abs(a) < 1e-8)
                {
                    Solution = "Coefficient of x is zero, cannot solve for x.";
                }
                else
                {
                    // Solve for x in a*x + b = c
                    double x = (c - b) / a;
                    Solution = $"x = {x}";
                }
            }
            catch (Exception ex)
            {
                Solution = "Error solving equation: " + ex.Message;
            }
        }
    }
}