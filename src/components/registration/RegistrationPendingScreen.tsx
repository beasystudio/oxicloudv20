import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Building2, Landmark, Clock, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import type { EntityType, RegistrationData } from '@/types/registration';

interface RegistrationPendingScreenProps {
  entityType: EntityType;
  data: RegistrationData;
}

export const RegistrationPendingScreen = ({ entityType, data }: RegistrationPendingScreenProps) => {
  const isEnterprise = entityType === 'enterprise';

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="text-center">
        <CardHeader className="pb-4">
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
            isEnterprise ? 'bg-primary/10' : 'bg-blue-500/10'
          }`}>
            {isEnterprise ? (
              <Building2 className="h-10 w-10 text-primary" />
            ) : (
              <Landmark className="h-10 w-10 text-blue-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            Registration Submitted Successfully
          </CardTitle>
          <CardDescription className="text-base">
            {isEnterprise 
              ? 'Your enterprise registration is being processed'
              : 'Your authority registration is pending verification'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status Card */}
          <div className={`p-4 rounded-lg border ${
            isEnterprise ? 'bg-primary/5 border-primary/20' : 'bg-blue-50 dark:bg-blue-950/20 border-blue-500/20'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className={isEnterprise ? 'h-5 w-5 text-primary' : 'h-5 w-5 text-blue-600'} />
              <span className="font-semibold">Status: Pending Review</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {isEnterprise 
                ? 'Our team is verifying your company details. This typically takes 1-2 business days.'
                : 'Our team is verifying your government affiliation. This typically takes 2-3 business days.'
              }
            </p>
          </div>

          {/* Summary */}
          <div className="text-left space-y-3 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium text-center mb-4">Registration Summary</h3>
            
            <div className="grid gap-2 text-sm">
              {isEnterprise ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT Number:</span>
                    <span className="font-medium">{data.vatNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company:</span>
                    <span className="font-medium">{data.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact:</span>
                    <span className="font-medium">{data.primaryContactName || `${data.firstName || ''} ${data.lastName || ''}`.trim()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{data.privateEmail || data.email}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Organization:</span>
                    <span className="font-medium">{data.organizationName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium">{data.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Employee:</span>
                    <span className="font-medium">{data.employeeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Work Email:</span>
                    <span className="font-medium">{data.workEmail}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="font-medium">What happens next?</h3>
            
            <div className="text-left space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Verification</p>
                  <p className="text-xs text-muted-foreground">
                    Our team will review your registration details
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Email Confirmation</p>
                  <p className="text-xs text-muted-foreground">
                    You'll receive an activation email at{' '}
                    <span className="font-medium">{isEnterprise ? (data.privateEmail || data.email) : data.workEmail}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Account Activation</p>
                  <p className="text-xs text-muted-foreground">
                    Click the activation link to set your password and access OxiCloud
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t space-y-3">
            <Link to="/login">
              <Button className="w-full" size="lg">
                Go to Login Page
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              Questions? Contact us at{' '}
              <a href="mailto:support@oxicloud.be" className="text-primary hover:underline">
                support@oxicloud.be
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
